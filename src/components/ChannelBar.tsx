import type { FunctionComponent } from "react";

import {
    faCarrot,
    faCog,
    faHashtag,
    faPlus,
    faSignOutAlt,
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
import { delServer } from "../reducers/servers";

import { Modal } from "./Modal";

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

    const [confirmLeave, setConfirmLeave] = useState(false);

    const outsideClick = () => {
        setMenuOpen(false);
        window.removeEventListener("click", outsideClick);
    };

    const leaveServer = async () => {
        const client = window.vex;
        await client.servers.leave(serverID);
        dispatch(delServer(serverID));
        history.push(routes.MESSAGING);
    };

    return (
        <div className="sidebar">
            <Modal
                acceptText={"Leave Server"}
                showCancel
                onAccept={leaveServer}
                active={confirmLeave}
                close={() => {
                    setConfirmLeave(false);
                }}
            >
                <div>
                    <p>
                        Are you sure you want to leave? You won&apos;t be able
                        to get back in without an invite link.
                    </p>
                </div>
            </Modal>
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
                                className="icon topbar-button"
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
                                <FontAwesomeIcon icon={faCarrot} />
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
                            <div className="dropdown-content has-text-weight-normal">
                                {isPermitted && (
                                    <Link
                                        to={`${routes.SERVERS}/${serverID}/invite-links`}
                                        className="dropdown-item"
                                    >
                                        <span className="icon">
                                            <FontAwesomeIcon
                                                icon={faUserPlus}
                                            />
                                        </span>
                                        &nbsp; Invite People
                                    </Link>
                                )}
                                {isPermitted && (
                                    <Link
                                        to={`${routes.SERVERS}/${serverID}/add-channel`}
                                        className="dropdown-item"
                                    >
                                        <span className="icon">
                                            <FontAwesomeIcon icon={faPlus} />
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
                                                        : ""
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
                                        <FontAwesomeIcon icon={faCog} />
                                    </span>
                                    &nbsp; Server Settings
                                </Link>
                                <a
                                    className="dropdown-item has-text-danger"
                                    onClick={() => {
                                        setConfirmLeave(true);
                                    }}
                                >
                                    <span className="icon">
                                        <FontAwesomeIcon
                                            icon={faSignOutAlt}
                                            className="has-text-danger"
                                        />
                                    </span>
                                    &nbsp; Leave Server
                                </a>
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
