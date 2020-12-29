import { faHashtag, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IServer } from "@vex-chat/libvex";
import React, { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { routes } from "../constants/routes";
import { selectChannels } from "../reducers/channels";
import { v4 } from "uuid";
import { selectPermissions } from "../reducers/permissions";

const { SERVERS } = routes;

export const ChannelBar: FunctionComponent<{ server: IServer }> = ({
    server: { serverID, name },
}) => {
    // TODO: temp let until behavior is better known
    let location = useLocation();
    const _channels = useSelector(selectChannels);

    const serverChannels = _channels[serverID];
    const channelIDs = Object.keys(serverChannels || {});

    const permissions = useSelector(selectPermissions);
    const isPermitted = permissions[serverID]?.powerLevel > 50;

    return (
        <div className="sidebar">
            <div className="server-titlebar">
                <h1 className="title is-size-4 server-title-text">{name} </h1>
            </div>
            {isPermitted && (
                <Link
                    to={`${SERVERS}/${serverID}/${v4()}/add-user`}
                    className={"button is-fullwidth is-small"}
                >
                    Invite
                    <span className="add-user-icon ml-1">
                        <FontAwesomeIcon
                            className="has-text-dark"
                            icon={faUserPlus}
                        />
                    </span>
                </Link>
            )}
            <aside className="menu">
                <ul className="menu-list">
                    {channelIDs.map((id) => {
                        const { name: chName, channelID } = serverChannels[id];
                        const isChannelActive = location.pathname.includes(
                            channelID
                        );

                        return (
                            <li key={channelID}>
                                <Link
                                    to={`${SERVERS}/${serverID}/${channelID}`}
                                    className={
                                        isChannelActive ? "is-active" : ""
                                    }
                                >
                                    <FontAwesomeIcon icon={faHashtag} />
                                    &nbsp;&nbsp;{chName}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </aside>
        </div>
    );
};
