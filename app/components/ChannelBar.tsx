import { XTypes } from "@vex-chat/types-js";
import { IServer } from "@vex-chat/vex-js";
import React from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { routes } from "../constants/routes";

export function ChannelBar(props: {
    server: IServer;
    channels: XTypes.SQL.IChannel[];
}): JSX.Element {
    const history = useHistory();

    return (
        <div className="sidebar">
            <div className="server-titlebar">
                <h1 className="title is-size-4 server-title-text">
                    {props.server.name}
                </h1>
            </div>
            <aside className="menu">
                <ul className="menu-list">
                    {props.channels.map((channel) => (
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
                                {channel.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    );
}
