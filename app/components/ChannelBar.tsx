import {
    faHashtag,
    faUserPlus,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { v4 } from "uuid";

import { routes } from "../constants/routes";
import { makeServerChannelsSelector } from "../reducers/channels";
import { makeIsPermittedSelector } from "../reducers/permissions";

const { SERVERS } = routes;

type ChannelBarProps = {
    serverID: string;
    name: string;
};

export const ChannelBar: FunctionComponent<ChannelBarProps> = ({
    serverID,
    name,
}) => {
    // TODO: temp let until behavior is better known
    let location = useLocation();
    const serverChannels = useSelector(makeServerChannelsSelector(serverID));
    const isPermitted = useSelector(makeIsPermittedSelector(serverID));

    const channelIDs = Object.keys(serverChannels);

    return (
        <div className="sidebar">
            <div className="server-titlebar">
                <h1 className="title is-size-4 server-title-text">
                    {name}
                    {isPermitted && (
                        <Link
                            to={`${SERVERS}/${serverID}/${v4()}/add-user`}
                            className="is-pulled-right button is-small"
                            style={{ border: "none" }}
                        >
                            <FontAwesomeIcon
                                className="has-text-dark"
                                icon={faPlus}
                            />
                        </Link>
                    )}
                </h1>
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
