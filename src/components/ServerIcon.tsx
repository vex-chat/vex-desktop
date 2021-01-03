import type { IServer } from "@vex-chat/libvex";

import { useHistory } from "react-router";
import { Link } from "react-router-dom";

import { routes } from "../constants/routes";
import { strToIcon } from "../utils/strToIcon";

export function ServerIcon(props: {
    server: IServer;
    routeOverride?: string;
}): JSX.Element {
    const history = useHistory();

    const href = props.routeOverride
        ? props.routeOverride
        : routes.SERVERS + "/" + props.server.serverID + "/channels";

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
