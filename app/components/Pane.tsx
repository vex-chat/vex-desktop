import { IUser } from "@vex-chat/vex-js";
import React, { Fragment, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory, useParams } from "react-router";
import { selectFamiliars } from "../reducers/familiars";
import { IconUsername } from "../components/IconUsername";
import { selectInputStates, addInputState } from "../reducers/inputs";
import { client, IDisplayMessage, switchFX } from "../views/Base";
import { ISzDisplayMessage } from "../reducers/messages";
import { selectMessages } from "../reducers/messages";
import { format } from "date-fns";
import { markSession, selectSessions } from "../reducers/sessions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
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

    const allVerified = !hasUnverifiedSession && sessionIDs.length > 0;

    const familiar: IUser | undefined = familiars[params.userID];
    const inputValue: string = inputValues[params.userID] || "";

    const allMessages = useSelector(selectMessages);
    const threadMessages = allMessages[params.userID];

    const messageIDs = Object.keys(threadMessages || {});
    const user = useSelector(selectUser);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (messagesEndRef.current as any).scrollIntoView();
        }
    };

    useEffect(() => {
        ReactTooltip.rebuild();
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
                                data-tip="This user has an unverified session."
                            >
                                <span className="icon">
                                    <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                    />
                                </span>
                                Unverified Session
                            </Link>
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
                    path={routes.MESSAGING + "/:userID/verify"}
                    component={() => (
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
                                                                    #
                                                                    {sessionID.slice(
                                                                        0,
                                                                        8
                                                                    )}
                                                                </code>
                                                            </th>

                                                            <th className="has-text-right">
                                                                {!session.verified && (
                                                                    <button
                                                                        className="button is-danger is-small"
                                                                        onClick={() => {
                                                                            history.push(
                                                                                routes.MESSAGING +
                                                                                    "/" +
                                                                                    familiar.userID +
                                                                                    "/verify/" +
                                                                                    session.sessionID
                                                                            );
                                                                        }}
                                                                    >
                                                                        Verify
                                                                    </button>
                                                                )}
                                                                {Boolean(
                                                                    session.verified
                                                                ) && (
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
                                            className="button"
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
                    component={() => (
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
                                                    <button
                                                        className="button is-success is-right"
                                                        onClick={async () => {
                                                            switchFX.play();
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
                                                })}
                                            </div>
                                        )}
                                    {messageIDs.map((key) => {
                                        return MessageBox(threadMessages[key]);
                                    })}
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

function MessageBox(message: IDisplayMessage | ISzDisplayMessage): JSX.Element {
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
