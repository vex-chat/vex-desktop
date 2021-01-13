import type { IServer } from "@vex-chat/libvex";

import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

import { routes } from "../constants/routes";
import { selectChannels } from "../reducers/channels";
import { getHistoryHead } from "../reducers/historyStacks";
import { strToIcon } from "../utils/strToIcon";

export function ServerIcon(props: { server: IServer }): JSX.Element {
    const historyHead = useSelector(getHistoryHead(props.server.serverID));
    const channels = useSelector(selectChannels(props.server.serverID));

    const params: { serverID?: string } = useParams();

    const channelIDs = Object.keys(channels);
    const headChannel = channels[channelIDs[0]];

    const href =
        routes.SERVERS +
        "/" +
        props.server.serverID +
        "/channels/" +
        (headChannel?.channelID || "");

    const isActiveModifier =
        params.serverID === props.server.serverID ? "is-active" : "";

    return (
        <div
            className={`server-icon-wrapper ${isActiveModifier}`}
            key={props.server.serverID}
        >
            <Link to={historyHead || href}>
                <img
                    className={`server-icon-image ${isActiveModifier}`}
                    src={props.server.icon || strToIcon(props.server.name)}
                />
            </Link>
        </div>
    );
}
