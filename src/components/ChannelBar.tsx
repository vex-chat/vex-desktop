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
import { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";

import { routes } from "../constants/routes";
import { selectApp, setApp } from "../reducers/app";
import { deleteChannel, selectChannels } from "../reducers/channels";
import { selectPermission } from "../reducers/permissions";

type ChannelBarProps = {
    serverID: string;
    name: string;
};

export const ChannelBar: FunctionComponent<ChannelBarProps> = ({
    serverID,
}) => {
    const [manageChannels, setManageChannels] = useState(false);
    const [markedChannels, setMarkedChannels] = useState([] as string[]);
    const { pathname } = useLocation();
    const serverChannels = useSelector(selectChannels(serverID));
    const dispatch = useDispatch();
    const history = useHistory();
    const app = useSelector(selectApp);

    const channelIDs = Object.keys(serverChannels);

    return (
        <div className="sidebar">
            {app.serverMenuOpen && (
                <ServerMenu
                    serverID={serverID}
                    setMenuOpen={(status: boolean) =>
                        dispatch(setApp("serverMenuOpen", status))
                    }
                    menuOpen={app.menuOpen as boolean}
                />
            )}
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

export function ServerTitlebar(props: {
    serverID: string;
    name: string;
}): JSX.Element {
    const dispatch = useDispatch();
    const app = useSelector(selectApp);

    const outsideClick = () => {
        dispatch(setApp("serverMenuOpen", false));
        window.removeEventListener("click", outsideClick);
    };

    return (
        <Fragment>
            <div className="server-titlebar">
                <h1 className="title is-size-4 server-title-text">
                    {props.name}
                    <div
                        className={`dropdown is-right is-pulled-right pointer ${
                            app.serverMenuOpen ? "is-active" : ""
                        }`}
                    >
                        <div className="dropdown-trigger">
                            <span
                                className="icon topbar-button"
                                onDoubleClick={(event) => {
                                    event.stopPropagation();
                                }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    if (!app.serverMenuOpen) {
                                        dispatch(
                                            setApp("serverMenuOpen", true)
                                        );
                                        window.addEventListener(
                                            "click",
                                            outsideClick
                                        );
                                    } else {
                                        dispatch(
                                            setApp("serverMenuOpen", false)
                                        );
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
                    </div>
                </h1>
            </div>
        </Fragment>
    );
}

export function ServerMenu(props: {
    serverID: string;
    menuOpen: boolean;
    setMenuOpen: (status: boolean) => void;
}): JSX.Element {
    console.log(props.menuOpen);

    const permission = useSelector(selectPermission(props.serverID));
    const isPermitted = permission?.powerLevel > 50 || false;

    return (
        <div
            className="dropdown-menu server-dropdown"
            id="dropdown-menu"
            role="menu"
            onClick={() => {
                props.setMenuOpen(false);
            }}
        >
            <div className="dropdown-content has-text-weight-normal">
                {isPermitted && (
                    <Link
                        to={`${routes.SERVERS}/${props.serverID}/invite-links`}
                        className="dropdown-item"
                    >
                        <span className="icon">
                            <FontAwesomeIcon icon={faUserPlus} />
                        </span>
                        &nbsp; Invite People
                    </Link>
                )}
                {isPermitted && (
                    <Link
                        to={`${routes.SERVERS}/${props.serverID}/add-channel`}
                        className="dropdown-item"
                    >
                        <span className="icon">
                            <FontAwesomeIcon icon={faPlus} />
                        </span>
                        &nbsp; Add Channel
                    </Link>
                )}
                <Link
                    to={routes.SERVERS + "/" + props.serverID + "/settings"}
                    className="dropdown-item"
                >
                    <span className="icon">
                        <FontAwesomeIcon icon={faCog} />
                    </span>
                    &nbsp; Server Settings
                </Link>
            </div>
        </div>
    );
}
