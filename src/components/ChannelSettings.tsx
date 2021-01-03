import type { IServerParams } from "~Types";

import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { selectChannels } from "../reducers/channels";

import { Highlighter } from "./Highlighter";

export function ChannelSettings(): JSX.Element {
    const params: IServerParams = useParams();
    const channels = useSelector(selectChannels(params.serverID));

    return (
        <div className="pane-screen-wrapper">
            <label className="label is-small">Details:</label>
            {Highlighter(
                JSON.stringify(channels[params.channelID] || {}, null, 4),
                "json"
            )}
        </div>
    );
}
