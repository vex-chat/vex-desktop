import type { FunctionComponent } from "react";
import type { IServerParams, RootState } from "~Types";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";

import { routes } from "../constants/routes";
import { useDebounce } from "../hooks/useDebounce";
import { add } from "../reducers/channels";
import { addInputState } from "../reducers/inputs";
import { selectServers } from "../reducers/servers";

export const AddChannel: FunctionComponent = () => {
    const history = useHistory();
    const servers = useSelector(selectServers);
    const { serverID } = useParams<IServerParams>();
    const dispatch = useDispatch();
    const server = servers[serverID];

    const FORM_NAME = `${serverID}/add-channel-form`;

    const channel = useSelector<RootState, string>(
        ({ inputs }) => inputs[FORM_NAME] || ""
    );

    const [inputVal, setInputVal] = useState("");

    const debouncedInput = useDebounce(inputVal, 500);

    useEffect(() => {
        dispatch(addInputState(FORM_NAME, debouncedInput));
    }, [debouncedInput]);

    const addChannel = async (enterChannel?: string) => {
        const client = window.vex;

        const newChannel = await client.channels.create(
            enterChannel || channel,
            serverID
        );

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
                        placeholder="cool names go here"
                        value={inputVal}
                        onChange={({ target: { value } }) => {
                            setInputVal(value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                void addChannel(inputVal);
                                setInputVal("");
                            }
                        }}
                    />
                </div>
                <div className="panel-block">
                    <button
                        className="button is-small"
                        onClick={() => {
                            setInputVal("");
                            void addChannel();
                        }}
                    >
                        Add channel to {server.name}
                    </button>
                </div>
            </div>
        </div>
    );
};
