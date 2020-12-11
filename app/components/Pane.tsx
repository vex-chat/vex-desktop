import { IUser } from "@vex-chat/vex-js";
import React, { Fragment, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory, useParams } from "react-router";
import { selectFamiliars } from "../reducers/familiars";
import { IconUsername } from "../components/IconUsername";
import { selectInputStates, addInputState } from "../reducers/inputs";
import { client } from "../views/Base";
import { ISzDisplayMessage } from "../reducers/messages";
import { selectMessages } from "../reducers/messages";
import { format } from "date-fns";
import {
    markConversation,
    selectConversations,
} from "../reducers/conversations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { routes } from "../constants/routes";
import { Link } from "react-router-dom";

export default function Pane(): JSX.Element {
    // state
    const dispatch = useDispatch();
    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const inputValues: Record<string, string> = useSelector(selectInputStates);
    const conversations = useSelector(selectConversations);

    const history = useHistory();

    // url parameters
    const params: { userID: string } = useParams();

    const fingerprints = Object.keys(conversations[params.userID] || {});
    let hasUnverifiedSession = false;
    for (const fingerprint of fingerprints) {
        if (!conversations[params.userID][fingerprint].verified) {
            hasUnverifiedSession = true;
        }
    }

    const familiar: IUser | undefined = familiars[params.userID];
    const inputValue: string = inputValues[params.userID] || "";

    const allMessages = useSelector(selectMessages);
    const threadMessages = allMessages[params.userID];

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
            <div className="pane-topbar">
                <div className="columns is-centered">
                    <div className="column is-narrow has-text-centered">
                        <div className="pane-topbar-content">
                            <div className="container">
                                {IconUsername(familiar, 32, "")}
                            </div>
                        </div>
                    </div>
                    <div className="column is-narrow">
                        {hasUnverifiedSession && (
                            <Link
                                to={
                                    routes.MESSAGING +
                                    "/" +
                                    params.userID +
                                    "/verify"
                                }
                                className="has-text-danger pointer help"
                            >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                Unverified
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <Switch>
                <Route
                    exact
                    path={routes.MESSAGING + "/:userID/verify"}
                    component={() => (
                        <div className="verify-wrapper">
                            <div className="verify-mnemonic-wrapper">
                                {fingerprints.map((fingerprint) => {
                                    const session =
                                        conversations[params.userID][
                                            fingerprint
                                        ];

                                    const mnemonic = client.sessions.verify(
                                        session
                                    );

                                    return (
                                        <div key={session.sessionID}>
                                            <code
                                                key={session.sessionID}
                                                className="verify-mnemonic"
                                            >
                                                <p className="is-family-monospace">
                                                    {mnemonic}
                                                </p>
                                            </code>

                                            <p>
                                                Verify with the other user
                                                through a secure method of
                                                communication that these words
                                                match.
                                            </p>
                                            <br />
                                            <p>
                                                If they don&apos;t match, you
                                                could be getting pwned.
                                            </p>
                                            <br />
                                            <div className="buttons">
                                                <button
                                                    className="button"
                                                    onClick={() => {
                                                        history.goBack();
                                                    }}
                                                >
                                                    Go Back
                                                </button>
                                                <button
                                                    className="button is-success"
                                                    onClick={async () => {
                                                        await client.sessions.markVerified(
                                                            fingerprint
                                                        );
                                                        dispatch(
                                                            markConversation(
                                                                params.userID,
                                                                fingerprint,
                                                                true
                                                            )
                                                        );
                                                    }}
                                                >
                                                    They Match
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                />
                <Route
                    exact
                    path={routes.MESSAGING + "/:userID"}
                    render={() => {
                        return (
                            <Fragment>
                                <div className="conversation-wrapper">
                                    {threadMessages &&
                                        Object.keys(threadMessages).map(
                                            (key) => {
                                                return MessageBox(
                                                    threadMessages[key]
                                                );
                                            }
                                        )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="chat-input-wrapper">
                                    <textarea
                                        value={inputValue}
                                        className="textarea chat-input has-fixed-size is-focused"
                                        rows={2}
                                        onChange={(event) => {
                                            dispatch(
                                                addInputState(
                                                    params.userID,
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

                                                client.messages.send(
                                                    familiar.userID,
                                                    inputValue
                                                );
                                                dispatch(
                                                    addInputState(
                                                        params.userID,
                                                        ""
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                </div>
                            </Fragment>
                        );
                    }}
                ></Route>
            </Switch>
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
