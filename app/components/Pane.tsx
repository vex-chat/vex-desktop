import { IUser } from "@vex-chat/vex-js";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { selectFamiliars } from "../reducers/familiars";
import { IconUsername } from "../components/IconUsername";
import { selectInputs, setInputState } from "../reducers/inputs";
import { client } from "../Base";

export default function Pane(): JSX.Element {
    // state
    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const inputValues: Record<string, string> = useSelector(selectInputs);
    const dispatch = useDispatch();

    // url parameters
    const { userID }: { userID: string } = useParams();

    const familiar: IUser | undefined = familiars[userID];
    const inputValue: string = inputValues[userID] || "";

    if (!familiar) {
        return <div className="pane"></div>;
    }

    return (
        <div className="pane">
            {TopBar(familiar)}
            <div className="conversation-wrapper">
                <div className="message-wrapper has-text-right">
                    <div className="tag is-large is-info message-box">
                        <p className="has-text-white">
                            <span className="has-text-left">
                                Testing a longer message.
                            </span>
                            <br />
                            <span className="help has-text-right">5m</span>
                        </p>
                    </div>
                </div>
                <div className="message-wrapper has-text-left">
                    <div className="tag is-large is-light message-box">
                        <p className="has-text-black">
                            <span className="has-text-left">Test</span>
                            <br />
                            <span className="help has-text-left">4m</span>
                        </p>
                    </div>
                </div>
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

function TopBar(user: IUser): JSX.Element {
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
