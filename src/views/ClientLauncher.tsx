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

import { sleep } from "@extrahash/sleep";
import { ipcRenderer, remote } from "electron";
import log from "electron-log";
import { EventEmitter } from "events";
import fs from "fs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";

import Loading from "../components/Loading";
import { dbFolder, keyFolder, progFolder } from "../constants/folders";
import { routes } from "../constants/routes";
import { setApp } from "../reducers/app";
import { addChannels } from "../reducers/channels";
import { addFamiliar, setFamiliars } from "../reducers/familiars";
import {
    add as groupAdd,
    addMany as groupAddMany,
} from "../reducers/groupMessages";
import {
    add as dmAdd,
    addMany as dmAddMany,
    serializeMessage,
} from "../reducers/messages";
import { addPermission, setPermissions } from "../reducers/permissions";
import { selectServers, setServers } from "../reducers/servers";
import { addSession, setSessions } from "../reducers/sessions";
import { setUser } from "../reducers/user";
import store from "../utils/DataStore";
import gaurdian from "../utils/KeyGaurdian";

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

let client: Client;

const onReadyCallback = async (username: string) => {
    const [, err] = await client.users.retrieve(client.getKeys().public);

    if (err !== null && err.response) {
        log.warn(
            `Server responded to users.retrieve() with ${err.response.status}`
        );

        switch (err.response.status) {
            case 404:
                launchEvents.emit("needs-register");
                break;
            default:
                await client.close();
                await sleep(1000 * 10);
                launchEvents.emit("retry");
        }
    }
    await client.login(username);
};

const launchEvents = new EventEmitter();

export async function initClient(): Promise<void> {
    if (window.vex && window.vex.hasInit) {
        await window.vex.close();
    }

    const PK = gaurdian.getKey();

    client = new Client(PK, {
        dbFolder,
        logLevel: "info",
        dbLogLevel: "warn",
    });

    const pubKey = client.getKeys().public;
    let deviceInfo = await client.devices.retrieve(pubKey);
    if (!deviceInfo) {
        log.warn("No device info found, probably need to register device.");
        const [username, password] = gaurdian.getAuthInfo();
        if (!username || !password) {
            throw new Error(
                "Username and password not present in gaurdian, but need to register device."
            );
        }

        await new Promise<void>((res, rej) => {
            const tempClient = new Client(client.getKeys().private, {
                dbFolder,
            });
            tempClient.on("ready", async () => {
                deviceInfo = await client.devices.register(username, password);
                res();
            });
            tempClient.init();
        });
    }

    if (!deviceInfo) {
        throw new Error("Couldn't register device and no device info found.");
    }

    const [userInfo, err] = await client.users.retrieve(deviceInfo.owner);
    if (!userInfo) {
        log.warn("No user info found, are you registered?");
        return;
    }
    if (err) {
        log.error(err);
        return;
    }

    window.vex = client;

    client.on("ready", () => void onReadyCallback(userInfo.username));

    void client.init();
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
    const servers = useSelector(selectServers);

    const notification = async (message: IMessage) => {
        if (
            store.get("settings.notifications") &&
            message.direction === "incoming"
        ) {
            if (remote.getCurrentWindow().isFocused()) {
                return;
            }

            const tempClient = new Client(undefined, { dbFolder });

            if (userRecords[message.sender] === undefined) {
                const [user] = await tempClient.users.retrieve(message.sender);
                if (!user) {
                    return;
                }
                userRecords[message.sender] = user;
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

            const userRecord = userRecords[message.sender];
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
                    history.push(routes.MESSAGING + "/" + message.sender);
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

        if (szMsg.group) {
            dispatch(groupAdd(szMsg));
        } else {
            dispatch(dmAdd(szMsg));
        }

        void notification(message);
    };

    const needsRegisterHandler = () => {
        history.push(routes.REGISTER);
    };

    const relaunch = async () => {
        await client.close();

        client.off("authed", () => void authedHandler());
        client.off("disconnect", () => void relaunch());
        client.off("session", sessionHandler);
        client.off("message", messageHandler);
        client.off(
            "permission",
            (permission: IPermission) => void permissionHandler(permission)
        );

        history.push(routes.LOGOUT + "?clear=off");
    };

    const sessionHandler = (session: ISession, user: IUser) => {
        dispatch(addSession(session));
        dispatch(addFamiliar(user));
    };

    const authedHandler = async () => {
        dispatch(setApp("initialLoad", true));
        const me = client.me.user();
        dispatch(setUser(me));

        history.push(routes.MESSAGING + "/" + me.userID);

        const sessions = await client.sessions.retrieve();
        dispatch(setSessions(objifySessions(sessions)));

        const familiars = await client.users.familiars();
        dispatch(setFamiliars(familiars));
        dispatch(addFamiliar(me));
        for (const user of familiars) {
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
    };

    const permissionHandler = async (permission: IPermission) => {
        dispatch(addPermission(permission));

        switch (permission.resourceType) {
            case "server":
                if (servers[permission.resourceID] === undefined) {
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
                }
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

    /* giving useMemo an empty set of dependencies
    so that this only happens once */
    useMemo(() => {
        ipcRenderer.on("relaunch", () => void relaunch());
        void initClient();
    }, []);

    useEffect(() => {
        launchEvents.on("needs-register", needsRegisterHandler);
        launchEvents.on("retry", () => void relaunch());

        client.on("authed", () => void authedHandler());
        client.on("disconnect", () => void relaunch());
        client.on("session", sessionHandler);
        client.on("message", messageHandler);
        client.on(
            "permission",
            (permission: IPermission) => void permissionHandler(permission)
        );

        return () => {
            launchEvents.off("needs-register", needsRegisterHandler);
            launchEvents.off("retry", () => void relaunch());
        };
    });
    return <Loading size={256} animation={"cylon"} />;
}
