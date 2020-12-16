import React, { Fragment, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { match } from "react-router";
import { ChannelBar } from "../components/ChannelBar";
import { chunkMessages, MessageBox } from "../components/Pane";
import { ServerBar } from "../components/ServerBar";
import { selectFamiliars } from "../reducers/familiars";
import { selectGroupMessages } from "../reducers/groupMessages";
import { addInputState, selectInputStates } from "../reducers/inputs";
import { selectServers } from "../reducers/servers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Server(props: { match: match<any> }): JSX.Element {
    const dispatch = useDispatch();
    const groupMessages = useSelector(selectGroupMessages);
    const servers = useSelector(selectServers);
    const familiars = useSelector(selectFamiliars);
    const inputs = useSelector(selectInputStates);
    const messagesEndRef = useRef(null);

    const { serverID, channelID } = props.match.params;
    const threadMessages = groupMessages[channelID];

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
        <div>
            <ServerBar />
            <ChannelBar server={servers[serverID]} />
            <div className="pane">
                {channelID !== undefined && (
                    <Fragment>
                        <div className="conversation-wrapper">
                            {chunkMessages(threadMessages || {}).map(
                                (chunk) => {
                                    return MessageBox(chunk, familiars);
                                }
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-wrapper">
                            <textarea
                                value={inputs[channelID]}
                                className="textarea chat-input has-fixed-size"
                                onChange={(event) => {
                                    dispatch(
                                        addInputState(
                                            channelID,
                                            event.target.value
                                        )
                                    );
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" &&
                                        !event.shiftKey
                                    ) {
                                        event.preventDefault();

                                        const client = window.vex;

                                        // send to group
                                        client.messages.group(
                                            channelID,
                                            inputs[channelID]
                                        );

                                        dispatch(addInputState(channelID, ""));
                                    }
                                }}
                            />
                        </div>
                    </Fragment>
                )}
            </div>
        </div>
    );
}
