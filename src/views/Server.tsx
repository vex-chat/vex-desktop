import { faHashtag, faServer } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch, useParams } from 'react-router';

import { ChannelBar } from '../components/ChannelBar';
import { ServerBar } from '../components/ServerBar';
import { routes } from '../constants/routes';
import { selectChannels } from '../reducers/channels';
import { selectServers } from '../reducers/servers';
import { UserMenu } from '../components/UserMenu';
import { AddUser } from '../components/ServerAddUser';
import { AddChannel } from '../components/ServerAddChannel';
import { ServerPane } from '../components/ServerPane';
import { ServerSettings } from '../components/ServerSettings';
import { ChannelSettings } from '../components/ChannelSettings';
import { capitalCase } from 'change-case';

export interface IServerParams {
    serverID: string;
    channelID: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Server(): JSX.Element {
    const { serverID, channelID, pageType, channelPage } = useParams<{
        serverID: string;
        channelID: string;
        pageType: string;
        channelPage?: string;
    }>();

    const servers = useSelector(selectServers);
    const serverChannels = useSelector(selectChannels(serverID));

    const server = servers[serverID];

    // loading
    if (!server) {
        return <div />;
    }

    return (
        <div>
            <ServerBar />
            <ChannelBar name={server.name} serverID={serverID} />
            <UserMenu />
            <div className="pane">
                <div className="pane-topbar">
                    {serverChannels[channelID] && (
                        <h2 className="subtitle">
                            <FontAwesomeIcon icon={faHashtag} />
                            &nbsp;&nbsp;
                            {serverChannels[channelID].name}{' '}
                            {channelPage ? capitalCase(channelPage) : ''}
                        </h2>
                    )}
                    {!serverChannels[channelID] && server !== undefined && (
                        <h2 className="subtitle">
                            <FontAwesomeIcon icon={faServer} />
                            &nbsp;&nbsp;
                            {server.name}{' '}
                            {pageType !== 'channels'
                                ? capitalCase(pageType)
                                : ''}
                        </h2>
                    )}
                </div>
                <Switch>
                    <Route
                        exact
                        path={routes.SERVERS + '/:serverID/add-user'}
                        render={() => <AddUser />}
                    />
                    <Route
                        exact
                        path={routes.SERVERS + '/:serverID/add-channel'}
                        render={() => <AddChannel />}
                    />
                    <Route
                        exact
                        path={routes.SERVERS + '/:serverID/settings'}
                        render={() => <ServerSettings />}
                    />
                    <Route
                        exact
                        path={
                            routes.SERVERS + '/:serverID/channels/:channelID?'
                        }
                        render={() => <ServerPane />}
                    />
                    <Route
                        exact
                        path={
                            routes.SERVERS +
                            '/:serverID/channels/:channelID?/:channelPage?'
                        }
                        render={() => <ChannelSettings />}
                    />
                </Switch>
            </div>
        </div>
    );
}
