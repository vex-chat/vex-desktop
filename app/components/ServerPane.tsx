import React, { useRef, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";
import {
    selectGroupMessages,
    failGroupMessage,
} from "../reducers/groupMessages";
import { selectInputStates, addInputState } from "../reducers/inputs";
import { chunkMessages } from "../utils/chunkMessages";
import { IServerParams } from "../views/Server";
import { MessageBox } from "./MessageBox";
import * as uuid from "uuid";

export function ServerPane(): JSX.Element {
    const params: IServerParams = useParams();
    const groupMessages = useSelector(selectGroupMessages);
    const threadMessages = groupMessages[params.channelID];
    const inputs = useSelector(selectInputStates);
    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (messagesEndRef.current as any).scrollIntoView();
        }
    };

    useEffect(() => {
        scrollToBottom();
    });

    return (
        <Fragment>
            <div className="conversation-wrapper">
                {chunkMessages(threadMessages || {}).map((chunk) => {
                    return (
                        <MessageBox
                            key={chunk[0]?.mailID || uuid.v4()}
                            messages={chunk}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-wrapper">
                <textarea
                    value={inputs[params.channelID]}
                    className="textarea chat-input has-fixed-size"
                    onChange={(event) => {
                        dispatch(
                            addInputState(params.channelID, event.target.value)
                        );
                    }}
                    onKeyDown={async (event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();

                            const messageText = inputs[params.channelID];
                            dispatch(addInputState(params.channelID, ""));

                            const client = window.vex;
                            try {
                                await client.messages.group(
                                    params.channelID,
                                    messageText
                                );
                            } catch (err) {
                                console.log(err);
                                if (err.message) {
                                    console.log(err);
                                    dispatch(
                                        failGroupMessage(
                                            err.message,
                                            err.error.error
                                        )
                                    );
                                } else {
                                    console.warn(err);
                                }
                            }
                        }
                    }}
                />
            </div>
        </Fragment>
    );
}
