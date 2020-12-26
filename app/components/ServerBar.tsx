import React from "react";
import { strToIcon } from "../utils/strToIcon";
import { routes } from "../constants/routes";
import { Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectServers } from "../reducers/servers";
import { IServer } from "@vex-chat/vex";
import {
    faEnvelopeOpenText,
    faPlus,
    IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function ServerBar(): JSX.Element {
    const servers = useSelector(selectServers);
    const history = useHistory();
    const serverIDs = Object.keys(servers);

    return (
        <div className="serverbar">
            <IconButton
                linkTo={routes.MESSAGING}
                icon={faEnvelopeOpenText}
                active={history.location.pathname.includes(routes.MESSAGING)}
            />
            {serverIDs.map((serverID) => (
                <ServerIcon key={serverID} server={servers[serverID]} />
            ))}
            <IconButton
                linkTo={routes.CREATE + "/server"}
                icon={faPlus}
                active={false}
            />
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

export function IconButton(props: {
    linkTo: string;
    icon: IconDefinition;
    active: boolean;
}): JSX.Element {
    return (
        <div className={`server-icon-wrapper`}>
            <Link to={props.linkTo}>
                <button
                    className={`button is-medium server-button${
                        props.active ? " is-active" : ""
                    }`}
                >
                    <span className="icon is-medium">
                        <FontAwesomeIcon
                            className="server-button-icon"
                            icon={props.icon}
                        />
                    </span>
                </button>
            </Link>
        </div>
    );
}
