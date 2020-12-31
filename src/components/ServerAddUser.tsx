import type { IServerParams } from '~Types';

import { IUser } from '@vex-chat/libvex';
import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { selectServers } from '../reducers/servers';
import { IconUsername } from './IconUsername';
import { emptyUser } from './MessagingBar';
import { UserSearchBar } from './UserSearchBar';

export function AddUser(): JSX.Element {
    const history = useHistory();
    const servers = useSelector(selectServers);
    const params: IServerParams = useParams();
    const [user, setUser] = useState(emptyUser);
    const server = servers[params.serverID];

    const addUserPermission = async (user: IUser) => {
        const client = window.vex;
        const { userID } = user;
        await client.permissions.create({
            userID,
            resourceType: 'server',
            resourceID: params.serverID,
        });
        history.goBack();
    };

    return (
        <div className="pane-screen-wrapper">
            <div className="panel">
                <div className="panel-heading">Add a user to {server.name}</div>
                <div className="panel-block">
                    <UserSearchBar
                        formName={
                            'server-user-serach-bar' +
                            params.serverID +
                            params.channelID
                        }
                        onFoundUser={(user: IUser) => {
                            setUser(user);
                        }}
                        onSelectUser={async (user: IUser) =>
                            addUserPermission(user)
                        }
                    />
                </div>
                {user !== emptyUser && (
                    <Fragment>
                        <div className="panel-block">{IconUsername(user)}</div>
                        <div className="panel-block">
                            <button
                                className="button is-small"
                                onClick={() => addUserPermission(user)}
                            >
                                Add user to {server.name}
                            </button>
                        </div>
                    </Fragment>
                )}
            </div>
        </div>
    );
}
