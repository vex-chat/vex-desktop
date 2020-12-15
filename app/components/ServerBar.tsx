import React from "react";
import * as uuid from "uuid";
import { strToIcon } from "../utils/strToIcon";
import { routes } from "../constants/routes";
import { Link, useHistory } from "react-router-dom";
import { _IServer } from "../views/Base";

const dmServer: _IServer = {
    serverID: uuid.v4(),
    name: "Direct Messages",
    icon: strToIcon("DM"),
};

export function ServerBar(props: { servers: _IServer[] }): JSX.Element {
    return (
        <div className="serverbar">
            <ServerIcon server={dmServer} routeOverride={routes.MESSAGING} />
            {props.servers.map((server) => (
                <ServerIcon key={server.serverID} server={server} />
            ))}
        </div>
    );
}

function ServerIcon(props: {
    server: _IServer;
    routeOverride?: string;
}): JSX.Element {
    const history = useHistory();

    const href = props.routeOverride
        ? props.routeOverride
        : routes.SERVERS + "/" + props.server.serverID;

    const isActiveModifier = history.location.pathname.includes(href)
        ? "is-active"
        : "";

    return (
        <div
            className={`server-icon-wrapper ${isActiveModifier}`}
            key={props.server.serverID}
        >
            <Link to={href}>
                <img
                    className={`server-icon-image ${isActiveModifier}`}
                    src={props.server.icon}
                />
            </Link>
        </div>
    );
}
