import { faHashtag, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IServer } from "@vex-chat/libvex";
import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { routes } from "../constants/routes";
import { selectChannels } from "../reducers/channels";
import * as uuid from "uuid";
import { selectPermissions } from "../reducers/permissions";

export function ChannelBar(props: { server: IServer }): JSX.Element {
    const history = useHistory();
    const _channels = useSelector(selectChannels);

    const serverChannels = _channels[props.server.serverID];
    const channelIDs = Object.keys(serverChannels || {});

    const permissions = useSelector(selectPermissions);
    const serverPermission = permissions[props.server.serverID]

    console.log(serverPermission);

    return (
        <div className="sidebar">
            <div className="server-titlebar">
                <h1 className="title is-size-4 server-title-text">
                    {props.server.name}{" "}
                    <Link
                        to={
                            routes.SERVERS +
                            "/" +
                            props.server.serverID +
                            "/" +
                            // accept channelID value for a later time
                            uuid.v4() +
                            "/add-user"
                        }
                    >
                        {serverPermission?.powerLevel > 50 && (
                            <span className="add-user-icon">
                            <FontAwesomeIcon
                                className="has-text-dark"
                                icon={faUserPlus}
                            />
                        </span>
                        )}

                    </Link>
                </h1>
            </div>
            <aside className="menu">
                <ul className="menu-list">
                    {channelIDs.map((channelID) => {
                        const channel = serverChannels[channelID];
                        return (
                            <li key={channel.channelID}>
                                <Link
                                    to={
                                        routes.SERVERS +
                                        "/" +
                                        props.server.serverID +
                                        "/" +
                                        channel.channelID
                                    }
                                    className={
                                        history.location.pathname.includes(
                                            channel.channelID
                                        )
                                            ? "is-active"
                                            : ""
                                    }
                                >
                                    <FontAwesomeIcon icon={faHashtag} />
                                    &nbsp;&nbsp;{channel.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </aside>
        </div>
    );
}
