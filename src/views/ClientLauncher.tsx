import type {
    Client,
    IMessage,
    IPermission,
    ISession,
    IUser,
} from "@vex-chat/libvex";
import type {
    IGroupSerializedMessage,
    ISerializedMessage,
} from "../reducers/messages";

import axios from "axios";
import { ipcRenderer } from "electron";
import log from "electron-log";
import fs from "fs";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";

import Loading from "../components/Loading";
import { dbFolder, keyFolder, progFolder } from "../constants/folders";
import { routes } from "../constants/routes";
import { setApp } from "../reducers/app";
import { addChannels } from "../reducers/channels";
import { addDevices } from "../reducers/devices";
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
import { setServers } from "../reducers/servers";
import { addSession, setSessions } from "../reducers/sessions";
import { setUser } from "../reducers/user";

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

export function ClientLauncher(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();

    const messageHandler = (message: IMessage) => {
        const szMsg = serializeMessage(message);

        if (szMsg.group) {
            dispatch(groupAdd(szMsg));
        } else {
            dispatch(dmAdd(szMsg));
        }
    };

    const relaunch = async () => {
        const client = window.vex;
        await client.close();

        client.off("connected", authedHandler);
        client.off("disconnect", relaunch);
        client.off("session", sessionHandler);
        client.off("message", messageHandler);
        client.off("permission", permissionHandler);
        ipcRenderer.off("relaunch", relaunch);

        history.push(routes.LOGOUT + "?clear=off?forward=" + routes.LOGIN);
    };

    const sessionHandler = async (session: ISession, user: IUser) => {
        dispatch(addSession(session));
        dispatch(addFamiliar(user));

        try {
            const res = await axios.get(
                "https://api.vex.chat/user/" + user.userID + "/devices"
            );
            dispatch(addDevices(res.data));
        } catch (err) {
            console.warn(err.toString);
        }
    };

    const authedHandler = async () => {
        const client = window.vex;
        dispatch(setApp("initialLoad", true));
        const me = client.me.user();
        dispatch(setUser(me));

        history.push(routes.MESSAGING + "/" + me.userID);

        const sessions = await client.sessions.retrieve();
        dispatch(setSessions(objifySessions(sessions)));

        const familiars = [...(await client.users.familiars()), me];
        dispatch(setFamiliars(familiars));

        for (const user of familiars) {
            try {
                const res = await axios.get(
                    "https://api.vex.chat/user/" + user.userID + "/devices"
                );
                dispatch(addDevices(res.data));
            } catch (err) {
                console.warn("error getting devices", err.toString());
            }

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

    const launch = () => {
        const client = window.vex;
        ipcRenderer.on("relaunch", relaunch);
        client.on("connected", authedHandler);
        client.on("disconnect", relaunch);
        client.on("session", sessionHandler);
        client.on("message", messageHandler);
        client.on("permission", permissionHandler);
        client.connect();
    };

    /* giving useMemo an empty set of dependencies
    so that this only happens once */
    useMemo(launch, [window.vex, launch]);

    return <Loading size={256} animation={"cylon"} />;
}
