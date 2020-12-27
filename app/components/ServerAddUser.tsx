import { IUser } from "@vex-chat/vex";
import React, { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { selectServers } from "../reducers/servers";
import { IServerParams } from "../views/Server";
import { IconUsername } from "./IconUsername";
import { emptyUser } from "./MessagingBar";
import { UserSearchBar } from "./UserSearchBar";

export function AddUser(): JSX.Element {
    const servers = useSelector(selectServers);
    const params: IServerParams = useParams();
    const [user, setUser] = useState(emptyUser);
    const server = servers[params.serverID];

    const addUserPermission = async (user: IUser) => {
        const client = window.vex;
        const { userID } = user;
        await client.permissions.create({
            userID,
            resourceType: "server",
            resourceID: params.serverID,
        });
    };

    return (
        <div className="pane-screen-wrapper">
            <div className="panel">
                <div className="panel-heading">Add a user to {server.name}</div>
                <div className="panel-block">
                    <UserSearchBar
                        formName={
                            "server-user-serach-bar" +
                            params.serverID +
                            params.channelID
                        }
                        onFoundUser={async (user: IUser) => {
                            setUser(user);
                        }}
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
