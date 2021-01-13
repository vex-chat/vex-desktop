import type { FunctionComponent } from "react";

import {
    faCarrot,
    faCog,
    faHashtag,
    faPlus,
    faTrash,
    faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";

import { routes } from "../constants/routes";
import { deleteChannel, selectChannels } from "../reducers/channels";
import { selectPermission } from "../reducers/permissions";

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
    const serverChannels = useSelector(selectChannels(serverID));
    const dispatch = useDispatch();
    const history = useHistory();
    const permission = useSelector(selectPermission(serverID));
    const isPermitted = permission?.powerLevel > 50 || false;

    const channelIDs = Object.keys(serverChannels);

    const outsideClick = () => {
        setMenuOpen(false);
        window.removeEventListener("click", outsideClick);
    };

    return (
        <div className="sidebar">
            <div className="server-titlebar">
                <h1 className="title is-size-4 server-title-text">
                    {name}
                    <div
                        className={`dropdown is-right is-pulled-right pointer ${
                            menuOpen ? "is-active" : ""
                        }`}
                    >
                        <div className="dropdown-trigger">
                            <span
                                className="icon"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    if (!menuOpen) {
                                        setMenuOpen(true);
                                        window.addEventListener(
                                            "click",
                                            outsideClick
                                        );
                                    } else {
                                        setMenuOpen(false);
                                        window.removeEventListener(
                                            "click",
                                            outsideClick
                                        );
                                    }
                                }}
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
                            onClick={() => {
                                setMenuOpen(false);
                            }}
                        >
                            <div className="dropdown-content">
                                {isPermitted && (
                                    <Link
                                        to={`${routes.SERVERS}/${serverID}/add-user`}
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
                                        to={`${routes.SERVERS}/${serverID}/add-channel`}
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
                                            setManageChannels(!manageChannels);
                                            if (!manageChannels) {
                                                setMarkedChannels([]);
                                            }
                                        }}
                                    >
                                        <span className="icon">
                                            <FontAwesomeIcon
                                                className={`${
                                                    manageChannels
                                                        ? "has-text-danger"
                                                        : "has-text-dark"
                                                }`}
                                                icon={faTrash}
                                            />
                                        </span>
                                        &nbsp;{" "}
                                        {manageChannels
                                            ? "Cancel Delete"
                                            : "Delete Channel"}
                                    </a>
                                )}
                                <Link
                                    to={
                                        routes.SERVERS +
                                        "/" +
                                        serverID +
                                        "/settings"
                                    }
                                    className="dropdown-item"
                                >
                                    <span className="icon">
                                        <FontAwesomeIcon
                                            className="has-text-dark"
                                            icon={faCog}
                                        />
                                    </span>
                                    &nbsp; Server Settings
                                </Link>
                            </div>
                        </div>
                    </div>
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
                            <li key={channelID} className="channel-bar-link">
                                <Link
                                    to={`${routes.SERVERS}/${serverID}/channels/${channelID}`}
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
                                                    : "has-text-grey"
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
                                                            serverID +
                                                            "/channels"
                                                    );
                                                }
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </span>
                                    )}
                                    <span
                                        className={`icon is-pulled-right`}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            history.push(
                                                `${routes.SERVERS}/${serverID}/channels/${channelID}/settings`
                                            );
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faCog}
                                            className="has-text-grey"
                                        />
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </aside>
        </div>
    );
};
