import {
    Client,
    IChannel,
    IMessage,
    IPermission,
    IServer,
    ISession,
    IUser,
} from '@vex-chat/libvex';
import { sleep } from '@extrahash/sleep';
import { ipcRenderer, remote } from 'electron';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { routes } from '../constants/routes';
import { setApp } from '../reducers/app';
import { addFamiliar, setFamiliars } from '../reducers/familiars';
import {
    addMessage,
    serializeMessage,
    IGroupSerializedMessage,
} from '../reducers/messages';
import { addSession, setSessions } from '../reducers/sessions';
import { setUser } from '../reducers/user';
import { EventEmitter } from 'events';
import log from 'electron-log';
import { selectServers, setServers } from '../reducers/servers';
import { addChannels } from '../reducers/channels';
import { add, addMany } from '../reducers/groupMessages';
import Loading from '../components/Loading';
import { addPermission, setPermissions } from '../reducers/permissions';
import fs from 'fs';
import { dbFolder, keyFolder, progFolder } from '../constants/folders';
import store from '../utils/DataStore';
import gaurdian from '../utils/KeyGaurdian';

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

const launchEvents = new EventEmitter();

export async function initClient(): Promise<void> {
    if (window.vex && window.vex.hasInit) {
        await window.vex.close();
    }

    console.log('call init client');

    const PK = gaurdian.getKey();

    client = new Client(PK, {
        dbFolder,
        logLevel: 'info',
    });

    console.log('PK', PK);

    window.vex = client;

    client.on('ready', async () => {
        const [, err] = await client.users.retrieve(client.getKeys().public);

        if (err !== null && err.response) {
            log.warn(
                `Server responded to users.retrieve() with ${err.response.status}`
            );

            switch (err.response.status) {
                case 404:
                    launchEvents.emit('needs-register');
                    break;
                default:
                    await client.close();
                    await sleep(1000 * 10);
                    launchEvents.emit('retry');
            }
        }

        await client.login();
    });

    client.init();
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
            store.get('settings.notifications') &&
            message.direction === 'incoming'
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
                    history.push(routes.MESSAGING + '/' + message.sender);
                };
            } else {
                const msgNotification = new Notification(
                    userRecord.username +
                        ' in ' +
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        serverRecord!.name +
                        '/' +
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        channelRecord!.name,
                    { body: message.message }
                );
                msgNotification.onclick = () => {
                    remote.getCurrentWindow().show();
                    history.push(
                        routes.SERVERS +
                            '/' +
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            serverRecord!.serverID +
                            '/channels' +
                            '/' +
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            channelRecord!.channelID
                    );
                };
            }
        }
    };

    const messageHandler = (message: IMessage) => {
        const szMsg = serializeMessage(message);

        if (szMsg.group) {
            dispatch(add(szMsg));
        } else {
            dispatch(addMessage(message));
        }

        notification(message);
    };

    const needsRegisterHandler = () => {
        history.push(routes.REGISTER);
    };

    const relaunch = async () => {
        await client.close();

        client.off('authed', authedHandler);
        client.off('disconnect', relaunch);
        client.off('session', sessionHandler);
        client.off('message', messageHandler);
        client.off('permission', permissionHandler);

        history.push(routes.LOGOUT + '?clear=off');
    };

    const sessionHandler = (session: ISession, user: IUser) => {
        dispatch(addSession(session));
        dispatch(addFamiliar(user));
    };

    const authedHandler = async () => {
        dispatch(setApp('initialLoad', true));
        const me = client.users.me();
        dispatch(setUser(me));

        history.push(routes.MESSAGING + '/' + me.userID);

        const sessions = await client.sessions.retrieve();
        dispatch(setSessions(objifySessions(sessions)));

        const familiars = await client.users.familiars();
        dispatch(setFamiliars(familiars));
        for (const user of familiars) {
            const history = await client.messages.retrieve(user.userID);
            for (const message of history) {
                dispatch(addMessage(message));
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
                    }

                    return acc;
                },
                []
            );

            dispatch(addMany({ messages: groupSzMsgs, group: channelID }));
        }

        const permissions = await client.permissions.retrieve();
        dispatch(setPermissions(permissions));

        dispatch(setApp('initialLoad', false));
    };

    const permissionHandler = async (permission: IPermission) => {
        dispatch(addPermission(permission));

        switch (permission.resourceType) {
            case 'server':
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
                    'Unsupported permission type ' +
                        permission.resourceType +
                        ' for permissionHandler().'
                );
                break;
        }
    };

    /* giving useMemo an empty set of dependencies
    so that this only happens once */
    useMemo(() => {
        ipcRenderer.on('relaunch', relaunch);
        initClient();
    }, []);

    useEffect(() => {
        launchEvents.on('needs-register', needsRegisterHandler);
        launchEvents.on('retry', relaunch);

        client.on('authed', authedHandler);
        client.on('disconnect', relaunch);
        client.on('session', sessionHandler);
        client.on('message', messageHandler);
        client.on('permission', permissionHandler);

        return () => {
            launchEvents.off('needs-register', needsRegisterHandler);
            launchEvents.off('retry', relaunch);
        };
    });
    return <Loading size={256} animation={'cylon'} />;
}
