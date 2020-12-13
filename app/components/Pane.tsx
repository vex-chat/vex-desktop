import { IMessage, IUser } from "@vex-chat/vex-js";
import React, { createRef, Fragment, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory, useParams } from "react-router";
import { selectFamiliars } from "../reducers/familiars";
import { IconUsername } from "../components/IconUsername";
import { selectInputStates, addInputState } from "../reducers/inputs";
import { ISerializedMessage } from "../reducers/messages";
import { selectMessages } from "../reducers/messages";
import { format } from "date-fns";
import { markSession, selectSessions } from "../reducers/sessions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@material-ui/core/Tooltip";
import {
    faCheckCircle,
    faExclamation,
    faExclamationTriangle,
    faLock,
    faSkull,
    faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import { routes } from "../constants/routes";
import { Link } from "react-router-dom";
import { selectUser } from "../reducers/user";
import crypto from "crypto";
import { client } from "./ClientLauncher";
import { Highlighter } from "./Highlighter";

export default function Pane(): JSX.Element {
    // state
    const dispatch = useDispatch();
    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const inputValues: Record<string, string> = useSelector(selectInputStates);
    const sessions = useSelector(selectSessions);

    const history = useHistory();

    // url parameters
    const params: { userID: string } = useParams();

    const sessionIDs = Object.keys(sessions[params.userID] || {});
    let hasUnverifiedSession = false;
    for (const sessionID of sessionIDs) {
        if (!sessions[params.userID][sessionID].verified) {
            hasUnverifiedSession = true;
        }
    }

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (messagesEndRef.current as any).scrollIntoView();
        }
    };

    useEffect(() => {
        scrollToBottom();
    });

    const allVerified = !hasUnverifiedSession && sessionIDs.length > 0;

    const familiar: IUser | undefined = familiars[params.userID];
    const inputValue: string = inputValues[params.userID] || "";

    const allMessages = useSelector(selectMessages);
    const threadMessages = allMessages[params.userID];

    const messageIDs = Object.keys(threadMessages || {});
    const user = useSelector(selectUser);

    const messagesEndRef = useRef(null);

    const messageOneRef = createRef();
    const messageTwoRef = createRef();
    const messageThreeRef = createRef();

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
                            <Tooltip
                                open={
                                    params.userID === user.userID &&
                                    !history.location.pathname.includes(
                                        "verify"
                                    )
                                }
                                title={
                                    "For new conversations, verify the other user's identity."
                                }
                            >
                                <Link
                                    to={
                                        routes.MESSAGING +
                                        "/" +
                                        params.userID +
                                        "/verify"
                                    }
                                    className="has-text-danger pointer help"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    ref={messageOneRef as any}
                                    data-event={"disabled"}
                                    data-multiline={true}
                                    data-tip={
                                        params.userID === user.userID
                                            ? "For new conversations, verify the other user's identity."
                                            : ""
                                    }
                                >
                                    <span className="icon">
                                        <FontAwesomeIcon
                                            icon={faExclamationTriangle}
                                        />
                                    </span>
                                    Unverified
                                </Link>
                            </Tooltip>
                        )}
                        {allVerified && (
                            <Link
                                to={
                                    routes.MESSAGING +
                                    "/" +
                                    params.userID +
                                    "/verify"
                                }
                                className="has-text-success pointer help"
                            >
                                <span className="icon">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                </span>
                                Verified
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <Switch>
                <Route
                    exact
                    path={routes.MESSAGING + "/:userID/info"}
                    render={() => (
                        <div className="verify-wrapper">
                            <div className="verify-mnemonic-wrapper">
                                {Highlighter(JSON.stringify(user, null, 4))}
                                <button
                                    className="button is-small"
                                    onClick={() => history.goBack()}
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    )}
                />
                <Route
                    exact
                    path={routes.MESSAGING + "/:userID/verify"}
                    render={() => (
                        <div className="verify-wrapper">
                            <div className="verify-mnemonic-wrapper">
                                <div className="panel">
                                    <p className="panel-heading">
                                        Active Sessions
                                    </p>
                                    {hasUnverifiedSession && (
                                        <div className="panel-block">
                                            <span className="icon">
                                                {" "}
                                                <FontAwesomeIcon
                                                    icon={faExclamation}
                                                    className="has-text-danger"
                                                />{" "}
                                            </span>
                                            <span className="help">
                                                This user has unverified
                                                sessions.
                                            </span>
                                        </div>
                                    )}
                                    {sessionIDs.map((sessionID) => {
                                        const session =
                                            sessions[params.userID][sessionID];
                                        return (
                                            <div
                                                key={sessionID}
                                                className="panel-block"
                                            >
                                                <table className="table is-fullwidth is-striped">
                                                    <tbody>
                                                        <tr>
                                                            <th>
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        session.verified
                                                                            ? faLock
                                                                            : faUnlock
                                                                    }
                                                                />
                                                            </th>
                                                            <th>
                                                                {" "}
                                                                <code>
                                                                    {sessionID}
                                                                </code>
                                                            </th>

                                                            <th className="has-text-right">
                                                                {!session.verified && (
                                                                    <span
                                                                        data-event={
                                                                            "disabled"
                                                                        }
                                                                        ref={
                                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                                            messageTwoRef as any
                                                                        }
                                                                    >
                                                                        <Tooltip
                                                                            open={
                                                                                params.userID ===
                                                                                    user.userID &&
                                                                                history.location.pathname.includes(
                                                                                    "verify"
                                                                                )
                                                                            }
                                                                            title={
                                                                                "Click here to verify the safe words."
                                                                            }
                                                                            placement="top"
                                                                        >
                                                                            <button
                                                                                className="button is-danger is-small"
                                                                                onClick={() => {
                                                                                    history.push(
                                                                                        history
                                                                                            .location
                                                                                            .pathname +
                                                                                            "/" +
                                                                                            session.sessionID
                                                                                    );
                                                                                }}
                                                                            >
                                                                                Verify
                                                                            </button>
                                                                        </Tooltip>
                                                                    </span>
                                                                )}
                                                                {session.verified && (
                                                                    <span>
                                                                        <span className="icon">
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    faCheckCircle
                                                                                }
                                                                                className="has-text-success"
                                                                            ></FontAwesomeIcon>
                                                                        </span>
                                                                    </span>
                                                                )}
                                                            </th>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })}
                                    <div className="panel-block">
                                        <button
                                            className="button is-small"
                                            onClick={() => history.goBack()}
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                />
                <Route
                    exact
                    path={routes.MESSAGING + "/:userID/verify/:sessionID"}
                    render={() => (
                        <div className="verify-wrapper">
                            <div className="verify-mnemonic-wrapper">
                                {sessionIDs.map((sessionID) => {
                                    const session =
                                        sessions[params.userID][sessionID];

                                    const mnemonic = client.sessions.verify(
                                        session
                                    );

                                    return (
                                        <div
                                            className="panel is-danger"
                                            key={session.sessionID}
                                        >
                                            <p className="panel-heading">
                                                Verify Session with{" "}
                                                {familiar.username}
                                            </p>
                                            <div className="panel-block">
                                                <code
                                                    key={session.sessionID}
                                                    className="verify-mnemonic"
                                                >
                                                    <label className="label is-small is-family-primary">
                                                        Safety Words:
                                                    </label>
                                                    <p>{mnemonic}</p>
                                                </code>
                                            </div>
                                            <div className="panel-block">
                                                <p>
                                                    <span className="icon">
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faExclamationTriangle
                                                            }
                                                            className="has-text-danger"
                                                        />
                                                    </span>
                                                    &nbsp;
                                                    {familiar.username} is using
                                                    an unverified session.
                                                </p>
                                            </div>
                                            <div className="panel-block">
                                                <p>
                                                    <span className="icon">
                                                        <FontAwesomeIcon
                                                            icon={faCheckCircle}
                                                            className="has-text-success"
                                                        />
                                                    </span>
                                                    &nbsp; Verify with the other
                                                    user that the words match.
                                                </p>
                                            </div>
                                            <div className="panel-block">
                                                <p>
                                                    <span className="icon">
                                                        <FontAwesomeIcon
                                                            icon={faSkull}
                                                        />
                                                    </span>
                                                    &nbsp; If they don&apos;t
                                                    match, you could be getting
                                                    pwned. &nbsp;
                                                </p>
                                            </div>
                                            <div className="panel-block">
                                                <div className="buttons is-right">
                                                    <button
                                                        className="button is-right"
                                                        onClick={() => {
                                                            history.goBack();
                                                        }}
                                                    >
                                                        Go Back
                                                    </button>
                                                    <Tooltip
                                                        open={
                                                            params.userID ===
                                                            user.userID
                                                        }
                                                        title={
                                                            "In real conversations, check that the words match and click here."
                                                        }
                                                    >
                                                        <button
                                                            className="button is-success is-right"
                                                            ref={
                                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                                messageThreeRef as any
                                                            }
                                                            data-event={
                                                                "disabled"
                                                            }
                                                            data-multiline={
                                                                true
                                                            }
                                                            onClick={async () => {
                                                                await client.sessions.markVerified(
                                                                    sessionID
                                                                );
                                                                dispatch(
                                                                    markSession(
                                                                        params.userID,
                                                                        sessionID,
                                                                        true
                                                                    )
                                                                );
                                                                history.push(
                                                                    routes.MESSAGING +
                                                                        "/" +
                                                                        params.userID
                                                                );
                                                            }}
                                                        >
                                                            They Match
                                                        </button>
                                                    </Tooltip>
                                                </div>
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
                                    {messageIDs.length === 0 &&
                                        params.userID === user.userID && (
                                            <div>
                                                {MessageBox({
                                                    timestamp: new Date(
                                                        Date.now()
                                                    ),
                                                    sender: user.userID,
                                                    recipient: user.userID,
                                                    direction: "incoming",
                                                    nonce: crypto
                                                        .randomBytes(24)
                                                        .toString("hex"),
                                                    message:
                                                        "Welcome to vex messenger!",
                                                    decrypted: true,
                                                })}
                                                {MessageBox({
                                                    timestamp: new Date(
                                                        Date.now()
                                                    ),
                                                    sender: user.userID,
                                                    recipient: user.userID,
                                                    direction: "incoming",
                                                    nonce: crypto
                                                        .randomBytes(24)
                                                        .toString("hex"),
                                                    message:
                                                        "This is a personal thread for taking notes, or whatever you'd like.",
                                                    decrypted: true,
                                                })}
                                            </div>
                                        )}
                                    {messageIDs.map((key) => {
                                        return MessageBox(threadMessages[key]);
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                                <Tooltip
                                    open={
                                        params.userID === user.userID &&
                                        !history.location.pathname.includes(
                                            "verify"
                                        ) &&
                                        Object.keys(threadMessages || {})
                                            .length === 0
                                    }
                                    title="Send a message here to try it out."
                                >
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
                                </Tooltip>
                            </Fragment>
                        );
                    }}
                ></Route>
            </Switch>
        </div>
    );
}

function MessageBox(message: IMessage | ISerializedMessage): JSX.Element {
    if (message.direction !== "incoming") {
        return (
            <div key={message.nonce} className="message-wrapper has-text-right">
                <div
                    className={`tag message-box ${
                        message.decrypted ? "is-info" : "is-danger"
                    }`}
                >
                    <div className="has-text-white">
                        <span className="has-text-left">
                            {message.decrypted ? (
                                <div className="message-text-wrapper">
                                    {message.message}
                                </div>
                            ) : (
                                <div className="message-text-wrapper">
                                    <code>
                                        <FontAwesomeIcon icon={faExclamation} />{" "}
                                        Decryption Failed
                                    </code>
                                </div>
                            )}
                        </span>
                        <br />
                        <span className="help has-text-right">
                            {format(new Date(message.timestamp), "kk:mm:ss")}
                        </span>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div key={message.nonce} className="message-wrapper has-text-left">
                <div
                    className={`tag message-box ${
                        message.decrypted ? "is-light" : "is-danger"
                    }`}
                >
                    <div
                        className={`${
                            message.decrypted
                                ? "has-text-black"
                                : "has-text-white"
                        }`}
                    >
                        <span className="has-text-left">
                            {message.decrypted ? (
                                <div className="message-text-wrapper">
                                    {message.message}
                                </div>
                            ) : (
                                <div className="message-text-wrapper">
                                    <code>
                                        <FontAwesomeIcon icon={faExclamation} />{" "}
                                        Decryption Failed
                                    </code>
                                </div>
                            )}
                        </span>
                        <br />
                        <span className="help has-text-right">
                            {format(new Date(message.timestamp), "kk:mm:ss")}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
