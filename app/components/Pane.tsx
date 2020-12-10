import { IUser } from "@vex-chat/vex-js";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { selectFamiliars } from "../reducers/familiars";
import { IconUsername } from "../components/IconUsername";
import { selectInputs, setInputState } from "../reducers/inputs";
import { client } from "../Base";
import { ISzDisplayMessage } from "../reducers/messages";
import { selectMessages } from "../reducers/messages";
import { format } from "date-fns";
import { selectUser } from "../reducers/user";

export default function Pane(): JSX.Element {
    // state
    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const user: IUser = useSelector(selectUser);
    const inputValues: Record<string, string> = useSelector(selectInputs);
    const dispatch = useDispatch();

    // url parameters
    const { userID }: { userID: string } = useParams();

    const familiar: IUser | undefined = familiars[userID];
    const inputValue: string = inputValues[userID] || "";

    const allMessages = useSelector(selectMessages);
    const threadMessages = allMessages[userID];

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (messagesEndRef.current as any).scrollIntoView();
        }
    };

    useEffect(() => {
        scrollToBottom();
    });

    if (!familiar) {
        return <div className="pane"></div>;
    }

    return (
        <div className="pane">
            {TopBar(familiar, user.userID === userID)}
            <div className="conversation-wrapper">
                {threadMessages &&
                    Object.keys(threadMessages).map((key) => {
                        return MessageBox(threadMessages[key]);
                    })}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-wrapper">
                <textarea
                    value={inputValue}
                    className="textarea chat-input"
                    rows={2}
                    onChange={(event) => {
                        dispatch(setInputState(userID, event.target.value));
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();

                            client.messages.send(familiar.userID, inputValue);
                            dispatch(setInputState(userID, ""));
                        }
                    }}
                />
            </div>
        </div>
    );
}

function MessageBox(message: ISzDisplayMessage): JSX.Element {
    if (message.direction !== "incoming") {
        return (
            <div key={message.nonce} className="message-wrapper has-text-right">
                <div className="tag is-large is-info message-box">
                    <p className="has-text-white">
                        <span className="has-text-left">{message.message}</span>
                        <br />
                        <span className="help has-text-right">
                            {format(new Date(message.timestamp), "kk:mm:ss")}
                        </span>
                    </p>
                </div>
            </div>
        );
    } else {
        return (
            <div key={message.nonce} className="message-wrapper has-text-left">
                <div className="tag is-large is-light message-box">
                    <p className="has-text-black">
                        <span className="has-text-left">{message.message}</span>
                        <br />
                        <span className="help has-text-right">
                            {format(new Date(message.timestamp), "kk:mm:ss")}
                        </span>
                    </p>
                </div>
            </div>
        );
    }
}

function TopBar(user: IUser, self = false): JSX.Element {
    if (!user) {
        return <div />;
    }

    if (self) {
        user.username = "Me";
    }

    return (
        <div className="pane-topbar">
            <div className="columns is-centered">
                <div className="column is-narrow has-text-centered">
                    <div className="pane-topbar-content">
                        <div className="container">
                            {IconUsername(user, 32)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
