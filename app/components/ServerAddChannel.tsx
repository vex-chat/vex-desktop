import React, { FunctionComponent, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";

import { useDebounce } from "../hooks/useDebounce";
import { selectServers } from "../reducers/servers";
import { add } from "../reducers/channels";
import { IServerParams } from "../views/Server";
import { addInputState } from "../reducers/inputs";
import { RootState } from "../store";

export const AddChannel: FunctionComponent = () => {
    const servers = useSelector(selectServers);
    const { serverID } = useParams<IServerParams>();
    const dispatch = useDispatch();
    const { name } = servers[serverID];

    const FORM_NAME = `${serverID}/add-channel-form`;

    const channel = useSelector<RootState, string>(
        ({ inputs }) => inputs[FORM_NAME] || ""
    );

    const [inputVal, setInputVal] = useState("");

    const debouncedInput = useDebounce(inputVal, 500);

    useEffect(() => {
        dispatch(addInputState(FORM_NAME, debouncedInput));
    }, [debouncedInput]);

    const AddChannelPermission = async (enterChannel?: string) => {
        const client = window.vex;

        const newChannel = await client.channels.create(
            enterChannel || channel,
            serverID
        );

        dispatch(add(newChannel));
    };

    return (
        <div className="pane-screen-wrapper">
            <div className="panel">
                <div className="panel-heading">Add a channel to {name}</div>
                <div className="panel-block">
                    <input
                        className="input"
                        type="text"
                        placeholder="cool names go here"
                        value={inputVal}
                        onChange={({ target: { value } }) => {
                            setInputVal(value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                AddChannelPermission(inputVal);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
