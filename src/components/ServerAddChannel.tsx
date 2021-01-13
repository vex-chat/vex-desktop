import type { FunctionComponent } from "react";
import type { IServerParams } from "~Types";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";

import { routes } from "../constants/routes";
import { add } from "../reducers/channels";
import { selectServers } from "../reducers/servers";

export const AddChannel: FunctionComponent = () => {
    const history = useHistory();
    const servers = useSelector(selectServers);
    const { serverID } = useParams<IServerParams>();
    const dispatch = useDispatch();
    const server = servers[serverID];

    const [inputVal, setInputVal] = useState("");

    const addChannel = async () => {
        const client = window.vex;

        if (inputVal.trim() === "") {
            return;
        }

        const newChannel = await client.channels.create(inputVal, serverID);

        dispatch(add(newChannel));
        history.push(
            routes.SERVERS +
                "/" +
                newChannel.serverID +
                "/" +
                newChannel.channelID
        );
    };

    return (
        <div className="pane-screen-wrapper">
            <div className="panel">
                <div className="panel-heading">
                    Add a channel to {server.name}
                </div>
                <div className="panel-block">
                    <input
                        className="input is-small"
                        type="text"
                        placeholder="fitness"
                        value={inputVal}
                        onChange={({ target: { value } }) => {
                            setInputVal(value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                addChannel();
                                setInputVal("");
                            }
                        }}
                    />
                </div>
                <div className="panel-block">
                    <button
                        className="button is-plain is-small"
                        onClick={() => {
                            setInputVal("");
                            addChannel();
                        }}
                    >
                        Add channel to {server.name}
                    </button>
                </div>
            </div>
        </div>
    );
};
