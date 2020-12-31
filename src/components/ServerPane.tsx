import React, { useRef, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { makeGroupMessageSelector, fail } from '../reducers/groupMessages';
import { selectInputStates, addInputState } from '../reducers/inputs';
import { chunkMessages } from '../utils/chunkMessages';
import { IServerParams } from '../views/Server';
import { MessageBox } from './MessageBox';
import * as uuid from 'uuid';
import { serializeMessage } from '../reducers/messages';

export function ServerPane(): JSX.Element {
    const { channelID } = useParams<IServerParams>();
    const threadMessages = useSelector(makeGroupMessageSelector(channelID));
    const inputs = useSelector(selectInputStates);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView();
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
                    value={inputs[channelID]}
                    className="textarea chat-input has-fixed-size"
                    onChange={(event) => {
                        dispatch(addInputState(channelID, event.target.value));
                    }}
                    onKeyDown={async (event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();

                            const messageText = inputs[channelID];
                            dispatch(addInputState(channelID, ''));

                            const client = window.vex;
                            try {
                                await client.messages.group(
                                    channelID,
                                    messageText
                                );
                            } catch (err) {
                                if (err.message) {
                                    const szMsg = serializeMessage(err.message);

                                    if (szMsg.group) {
                                        dispatch(
                                            fail({
                                                message: szMsg,
                                                errorString: err.error.error,
                                            })
                                        );
                                    }
                                }
                            }
                        }
                    }}
                />
            </div>
        </Fragment>
    );
}
