import {
    faHashtag,
    faUserPlus,
    faCarrot,
    faPlus,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";
import * as uuid from "uuid";

import { routes } from "../constants/routes";
import {
    deleteChannel,
    makeServerChannelsSelector,
} from "../reducers/channels";
import { makeIsPermittedSelector } from "../reducers/permissions";

type ChannelBarProps = {
    serverID: string;
    name: string;
};

export const ChannelBar: FunctionComponent<ChannelBarProps> = ({
    serverID,
    name,
}) => {
    const [manageChannels, setManageChannels] = useState(false);
    const [markedChannels, setMarkedChannels] = useState([] as string[]);
    const [menuOpen, setMenuOpen] = useState(false);
    const { pathname } = useLocation();
    const serverChannels = useSelector(makeServerChannelsSelector(serverID));
    const dispatch = useDispatch();
    const history = useHistory();
    const isPermitted = useSelector(makeIsPermittedSelector(serverID));

    const channelIDs = Object.keys(serverChannels);

    return (
        <div className="sidebar">
            <div className="server-titlebar">
                <h1 className="title is-size-4 server-title-text">
                    {name}
                    {/* For now, everything in here requires permissions, but eventually will contain
                        non permissioned items. We can hide it until then. */}
                    {isPermitted && (
                        <div
                            className={`dropdown is-right is-pulled-right pointer ${
                                menuOpen ? "is-active" : ""
                            }`}
                        >
                            <div className="dropdown-trigger">
                                <span
                                    className="icon"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    <FontAwesomeIcon
                                        className="has-text-dark"
                                        icon={faCarrot}
                                    />
                                </span>
                            </div>
                            <div
                                className="dropdown-menu"
                                id="dropdown-menu"
                                role="menu"
                                onClick={() => setMenuOpen(false)}
                            >
                                <div className="dropdown-content">
                                    {isPermitted && (
                                        <Link
                                            to={`${
                                                routes.SERVERS
                                            }/${serverID}/${uuid.v4()}/add-user`}
                                            className="dropdown-item"
                                        >
                                            <span className="icon">
                                                <FontAwesomeIcon
                                                    className="has-text-dark"
                                                    icon={faUserPlus}
                                                />
                                            </span>
                                            &nbsp; Add User
                                        </Link>
                                    )}
                                    {isPermitted && (
                                        <Link
                                            to={`${
                                                routes.SERVERS
                                            }/${serverID}/${uuid.v4()}/add-channel`}
                                            className="dropdown-item"
                                        >
                                            <span className="icon">
                                                <FontAwesomeIcon
                                                    className="has-text-dark"
                                                    icon={faPlus}
                                                />
                                            </span>
                                            &nbsp; Add Channel
                                        </Link>
                                    )}
                                    {isPermitted && (
                                        <a
                                            className="dropdown-item"
                                            onClick={() => {
                                                setManageChannels(true);
                                            }}
                                        >
                                            <span className="icon">
                                                <FontAwesomeIcon
                                                    className="has-text-dark"
                                                    icon={faTrash}
                                                />
                                            </span>
                                            &nbsp; Delete Channel
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </h1>
            </div>

            <aside className="menu">
                <ul className="menu-list">
                    {channelIDs.map((channelID) => {
                        const channel = serverChannels[channelID];
                        const chLinkStyle = pathname.includes(channelID)
                            ? "is-active"
                            : "";

                        return (
                            <li key={channelID}>
                                <Link
                                    to={`${routes.SERVERS}/${serverID}/${channelID}`}
                                    className={chLinkStyle}
                                >
                                    <FontAwesomeIcon icon={faHashtag} />
                                    &nbsp;&nbsp;{channel.name}
                                    {manageChannels && (
                                        <span
                                            className={`icon is-pulled-right ${
                                                markedChannels.includes(
                                                    channelID
                                                )
                                                    ? "has-text-danger"
                                                    : ""
                                            }`}
                                            onClick={async () => {
                                                if (
                                                    !markedChannels.includes(
                                                        channelID
                                                    )
                                                ) {
                                                    const copy = [
                                                        ...markedChannels,
                                                    ];
                                                    copy.push(channelID);
                                                    setMarkedChannels(copy);
                                                } else {
                                                    console.log(
                                                        "Deletarino " +
                                                            channelID
                                                    );
                                                    const client = window.vex;
                                                    await client.channels.delete(
                                                        channelID
                                                    );
                                                    setMarkedChannels([]);
                                                    setManageChannels(false);
                                                    dispatch(
                                                        deleteChannel(channel)
                                                    );
                                                    history.push(
                                                        routes.SERVERS +
                                                            "/" +
                                                            serverID
                                                    );
                                                }
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </aside>
        </div>
    );
};
