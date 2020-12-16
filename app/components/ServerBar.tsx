import React from "react";
import * as uuid from "uuid";
import { strToIcon } from "../utils/strToIcon";
import { routes } from "../constants/routes";
import { Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectServers } from "../reducers/servers";
import { IServer } from "@vex-chat/vex-js";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const dmServer: IServer = {
    serverID: uuid.v4(),
    name: "Direct Messages",
    icon: strToIcon("DM"),
};

export function ServerBar(): JSX.Element {
    const servers = useSelector(selectServers);
    const serverIDs = Object.keys(servers);

    return (
        <div className="serverbar">
            <ServerIcon server={dmServer} routeOverride={routes.MESSAGING} />
            {serverIDs.map((serverID) => (
                <ServerIcon key={serverID} server={servers[serverID]} />
            ))}
            <div className={`server-icon-wrapper`}>
                <Link to={routes.CREATE + "/server"}>
                    <button className="button is-medium server-button">
                        <span className="icon is-medium">
                            <FontAwesomeIcon
                                className="server-button-icon"
                                icon={faPlus}
                            />
                        </span>
                    </button>
                </Link>
            </div>
        </div>
    );
}

function ServerIcon(props: {
    server: IServer;
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
                    src={props.server.icon || strToIcon(props.server.name)}
                />
            </Link>
        </div>
    );
}
