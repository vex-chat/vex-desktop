import type {
    IChannel,
    IMessage,
    IPermission,
    IServer,
    ISession,
    IUser,
} from "@vex-chat/libvex";
import type {
    IGroupSerializedMessage,
    ISerializedMessage,
} from "../reducers/messages";

import { Client } from "@vex-chat/libvex";

import axios from "axios";
import { ipcRenderer, remote } from "electron";
import log from "electron-log";
import fs from "fs";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";

import { Loading } from "../components";
import {
    dbFolder,
    keyFolder,
    notifyFX,
    progFolder,
    routes,
} from "../constants";
import { setApp } from "../reducers/app";
import { addChannels } from "../reducers/channels";
import { addDevices } from "../reducers/devices";
import { addFamiliar, setFamiliars } from "../reducers/familiars";
import {
    add as groupAdd,
    addMany as groupAddMany,
} from "../reducers/groupMessages";
import { selectLastVisitedServer } from "../reducers/historyStacks";
import {
    add as dmAdd,
    addMany as dmAddMany,
    serializeMessage,
} from "../reducers/messages";
import { addPermission, setPermissions } from "../reducers/permissions";
import { setServers } from "../reducers/servers";
import { addSession, setSessions } from "../reducers/sessions";
import { setUser } from "../reducers/user";
import { createClient, DataStore, gaurdian } from "../utils";

declare global {
    interface Window {
        vex: Client;
    }
}

// this maybe needs a better place to go
const folders = [progFolder, dbFolder, keyFolder];
for (const folder of folders) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
}

function objifySessions(sessions: ISession[]): Record<string, ISession[]> {
    const sessionsObj: Record<string, ISession[]> = {};

    for (const sess of sessions) {
        if (sessionsObj[sess.userID] === undefined) {
            sessionsObj[sess.userID] = [];
        }
        sessionsObj[sess.userID].push(sess);
    }
    return sessionsObj;
}

const userRecords: Record<string, IUser> = {};
const channelRecords: Record<string, IChannel> = {};
const serverRecords: Record<string, IServer> = {};

export function ClientLauncher(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();
    const lastVisited = useSelector(selectLastVisitedServer);

    if (lastVisited) {
        console.log("THE LAST VISITED WAS", lastVisited);
    }

    const notification = async (message: IMessage) => {
        const globalNotifications = DataStore.get(
            "settings.notifications"
        ) as boolean;

        const client = window.vex;
        const me = client.me.user();

        const mentionsUs = message.message.includes(me.userID);
        const sounds = DataStore.get("settings.sounds") as boolean;

        // all notifications are off
        if (!mentionsUs && !globalNotifications) {
            return;
        }

        if (mentionsUs && !globalNotifications) {
            if (!mentionsUs) {
                return;
            }
        }

        if (
            message.direction === "incoming" &&
            message.authorID !== me.userID
        ) {
            if (process.platform !== "darwin" && process.platform !== "win32") {
                if (sounds) {
                    await notifyFX.play();
                }
            }

            const tempClient = await createClient(true);

            if (userRecords[message.authorID] === undefined) {
                const [user] = await tempClient.users.retrieve(
                    message.authorID
                );
                if (!user) {
                    return;
                }
                userRecords[message.authorID] = user;
            }
            if (
                message.group !== null &&
                channelRecords[message.group] === undefined
            ) {
                const channel = await tempClient.channels.retrieveByID(
                    message.group
                );
                if (!channel) {
                    return;
                }
                channelRecords[message.group] = channel;

                if (serverRecords[channel.serverID] === undefined) {
                    const server = await tempClient.servers.retrieveByID(
                        channel.serverID
                    );
                    if (!server) {
                        return;
                    }
                    serverRecords[channel.serverID] = server;
                }
            }

            const userRecord = userRecords[message.authorID];
            const channelRecord = message.group
                ? channelRecords[message.group]
                : null;
            const serverRecord = message.group
                ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  serverRecords[channelRecord!.serverID]
                : null;

            if (message.group === null) {
                const msgNotification = new Notification(userRecord.username, {
                    body: message.message,
                });
                msgNotification.onclick = () => {
                    remote.getCurrentWindow().show();
                    history.push(routes.MESSAGING + "/" + message.authorID);
                };
            } else {
                if (!serverRecord || !channelRecord) {
                    return;
                }
                const msgNotification = new Notification(
                    userRecord.username +
                        " in " +
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        serverRecord.name +
                        "/" +
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        channelRecord.name,
                    { body: message.message }
                );
                msgNotification.onclick = () => {
                    remote.getCurrentWindow().show();
                    history.push(
                        routes.SERVERS +
                            "/" +
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            serverRecord.serverID +
                            "/channels" +
                            "/" +
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            channelRecord.channelID
                    );
                };
            }
        }
    };

    const messageHandler = (message: IMessage) => {
        const szMsg = serializeMessage(message);

        const directMessagesEnabled: boolean = DataStore.get(
            "settings.directMessages"
        ) as boolean;
        if (szMsg.group) {
            dispatch(groupAdd(szMsg));
        } else {
            if (directMessagesEnabled) {
                dispatch(dmAdd(szMsg));
            }
        }
    };

    const relaunch = async () => {
        const client = window.vex;
        await client.close();

        client.off("connected", connectedHandler);
        client.off("disconnect", relaunch);
        client.off("session", sessionHandler);
        client.off("message", messageHandler);
        client.off("permission", permissionHandler);
        client.off("message", notification);
        ipcRenderer.off("relaunch", relaunch);

        history.push(routes.LOGIN);
    };

    const sessionHandler = async (session: ISession, user: IUser) => {
        dispatch(addSession(session));
        dispatch(addFamiliar(user));
        const client = window.vex;
        try {
            const res = await axios.get(
                client.getHost() + "/user/" + user.userID + "/devices"
            );
            dispatch(addDevices(res.data));
        } catch (err) {
            console.warn(err.toString);
        }
    };

    const connectedHandler = async () => {
        const client = window.vex;
        dispatch(setApp("initialLoad", true));
        const me = client.me.user();

        dispatch(setUser(me));

        history.push(lastVisited || routes.MESSAGING + "/" + me.userID);

        const sessions = await client.sessions.retrieve();
        dispatch(setSessions(objifySessions(sessions)));

        const familiars = [...(await client.users.familiars()), me];
        dispatch(setFamiliars(familiars));

        for (const user of familiars) {
            try {
                const res = await axios.get(
                    client.getHost() + "/user/" + user.userID + "/devices"
                );
                dispatch(addDevices(res.data));
            } catch (err) {
                console.warn("error getting devices", err.toString());
            }

            if (DataStore.get("settings.directMessages")) {
                const history = await client.messages.retrieve(user.userID);
                const szHistory = history.reduce<ISerializedMessage[]>(
                    (acc, msg) => {
                        const szMsg = serializeMessage(msg);
                        if (!szMsg.group) {
                            acc.push(szMsg);
                        } else {
                            log.warn("Group messages found in dm history.");
                        }
                        return acc;
                    },
                    []
                );

                if (szHistory.length > 0) {
                    dispatch(
                        dmAddMany({ messages: szHistory, userID: user.userID })
                    );
                }
            }
        }

        const knownChannels: string[] = [];

        const servers = await client.servers.retrieve();
        dispatch(setServers(servers));
        for (const server of servers) {
            const channels = await client.channels.retrieve(server.serverID);
            dispatch(addChannels(channels));
            for (const channel of channels) {
                knownChannels.push(channel.channelID);
            }
        }

        for (const channelID of knownChannels) {
            const history = await client.messages.retrieveGroup(channelID);

            const groupSzMsgs = history.reduce<IGroupSerializedMessage[]>(
                (acc, msg) => {
                    const szMsg = serializeMessage(msg);

                    if (szMsg.group) {
                        acc.push(szMsg);
                    } else {
                        log.warn("Non group messages found in group history.");
                    }

                    return acc;
                },
                []
            );

            if (groupSzMsgs.length > 0) {
                dispatch(
                    groupAddMany({ messages: groupSzMsgs, group: channelID })
                );
            }
            dispatch(groupAddMany({ messages: groupSzMsgs, group: channelID }));
        }

        const permissions = await client.permissions.retrieve();
        dispatch(setPermissions(permissions));
        dispatch(setApp("initialLoad", false));
        client.on("message", notification);
    };

    const permissionHandler = async (permission: IPermission) => {
        dispatch(addPermission(permission));

        switch (permission.resourceType) {
            case "server":
                await (async () => {
                    const client = window.vex;
                    const newServers = await client.servers.retrieve();
                    dispatch(setServers(newServers));

                    const newPermissions = await client.permissions.retrieve();
                    dispatch(setPermissions(newPermissions));

                    for (const server of newServers) {
                        const channels = await client.channels.retrieve(
                            server.serverID
                        );
                        dispatch(addChannels(channels));
                    }
                })();
                break;
            default:
                log.info(
                    "Unsupported permission type " +
                        permission.resourceType +
                        " for permissionHandler()."
                );
                break;
        }
    };

    const launch = async () => {
        const client = window.vex;
        ipcRenderer.on("relaunch", relaunch);
        client.on("connected", connectedHandler);
        client.on("disconnect", relaunch);
        client.on("session", sessionHandler);
        client.on("message", messageHandler);
        client.on("permission", permissionHandler);
        try {
            await client.connect();
        } catch (err) {
            switch (err.response.status) {
                case 470:
                    // eslint-disable-next-line no-case-declarations
                    const keyFilePath = gaurdian.getKeyFilePath();
                    if (keyFilePath) {
                        fs.rename(
                            keyFilePath,
                            `${keyFilePath}-bak`,
                            async () => {
                                // generate new SK
                                const SK = Client.generateSecretKey();
                                const keyPath =
                                    keyFolder +
                                    "/" +
                                    client.me.user().username.toLowerCase();
                                Client.saveKeyFile(keyPath, "", SK);
                                const newClient = await createClient(false, SK);
                                window.vex = newClient;
                                setTimeout(relaunch, 5000);
                            }
                        );
                    }
                    break;
                default:
                    setTimeout(relaunch, 5000);
                    break;
            }
        }
    };

    useMemo(launch, [window.vex, launch]);

    return <Loading size={256} animation={"cylon"} />;
}
