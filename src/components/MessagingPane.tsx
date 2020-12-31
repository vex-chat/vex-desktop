import { IUser } from "@vex-chat/libvex";
import React, { createRef, Fragment, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory, useParams } from "react-router";
import { selectFamiliars } from "../reducers/familiars";
import { selectInputStates, addInputState } from "../reducers/inputs";
import { failMessage, ISerializedMessage } from "../reducers/messages";
import { selectMessages } from "../reducers/messages";
import { markSession, selectSessions } from "../reducers/sessions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as uuid from "uuid";
import {
    faAt,
    faCheckCircle,
    faEnvelopeOpenText,
    faExclamationCircle,
    faExclamationTriangle,
    faLock,
    faSkull,
    faTimes,
    faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import { routes } from "../constants/routes";
import { selectUser } from "../reducers/user";
import nacl from "tweetnacl";
import { XUtils } from "@vex-chat/crypto";
import { Highlighter } from "./Highlighter";
import { chunkMessages } from "../utils/chunkMessages";
import { MessageBox } from "./MessageBox";
import { useQuery } from "../hooks/useQuery";
import { FamiliarMenu } from "./FamiliarMenu";
import { IconUsername } from "./IconUsername";

export default function MessagingPane(): JSX.Element {
    // state
    const dispatch = useDispatch();
    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const inputValues: Record<string, string> = useSelector(selectInputStates);
    const history = useHistory();
    // url parameters
    const params: { userID: string } = useParams();

    const query = useQuery();

    const sessions = useSelector(selectSessions);

    const sessionIDs = Object.keys(sessions[params.userID] || {});
    let hasUnverifiedSession = false;
    for (const sessionID of sessionIDs) {
        if (!sessions[params.userID][sessionID].verified) {
            hasUnverifiedSession = true;
        }
    }

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageTwoRef = createRef<HTMLDivElement>();
    const messageThreeRef = createRef<HTMLButtonElement>();

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView();
        }
    };

    useEffect(() => {
        scrollToBottom();
    });

    const familiar: IUser | undefined = familiars[params.userID];
    const inputValue: string = inputValues[params.userID] || "";

    const allMessages = useSelector(selectMessages);
    const threadMessages = allMessages[params.userID];

    const messageIDs = Object.keys(threadMessages || {});
    const user = useSelector(selectUser);

    if (!familiar) {
        return (
            <div className="pane">
                <div className="pane-topbar">
                    <h1 className="subtitle">
                        <FontAwesomeIcon icon={faEnvelopeOpenText} />
                        &nbsp;&nbsp; Direct Messages
                    </h1>
                </div>
            </div>
        );
    }
    return (
        <div className="pane">
            <div className="pane-topbar">
                <div className="columns">
                    <div className="column is-narrow">
                        <div className="pane-topbar-content">
                            <FamiliarMenu
                                familiar={familiar}
                                trigger={IconUsername(familiar, 32, faAt)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Switch>
                <Route
                    exact
                    path={routes.MESSAGING + "/:userID/info"}
                    render={() => {
                        return (
                            <div className="pane-screen-wrapper">
                                <div className="verify-mnemonic-wrapper">
                                    <label className="label is-small">
                                        Details:
                                    </label>
                                    {Highlighter(
                                        JSON.stringify(familiar, null, 4),
                                        "json"
                                    )}
                                    <button
                                        className="button is-small t-12"
                                        onClick={() => history.goBack()}
                                    >
                                        Go Back
                                    </button>
                                </div>
                            </div>
                        );
                    }}
                />
                <Route
                    exact
                    path={routes.MESSAGING + "/:userID/verify"}
                    render={() => (
                        <div className="pane-screen-wrapper">
                            <div className="panel">
                                <p className="panel-heading">Active Sessions</p>
                                {hasUnverifiedSession && (
                                    <div className="panel-block">
                                        <span className="icon">
                                            {" "}
                                            <FontAwesomeIcon
                                                icon={faExclamationCircle}
                                                className="has-text-warning"
                                            />{" "}
                                        </span>
                                        <span className="help">
                                            This user has unverified sessions.
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
                                                                <div
                                                                    data-event={
                                                                        "disabled"
                                                                    }
                                                                    ref={
                                                                        messageTwoRef
                                                                    }
                                                                >
                                                                    <button
                                                                        className="button is-danger is-small"
                                                                        onClick={() => {
                                                                            const forwardPath = query.get(
                                                                                "forward"
                                                                            );

                                                                            history.push(
                                                                                history
                                                                                    .location
                                                                                    .pathname +
                                                                                    "/" +
                                                                                    session.sessionID +
                                                                                    (forwardPath !==
                                                                                    null
                                                                                        ? "?forward=" +
                                                                                          forwardPath
                                                                                        : "")
                                                                            );
                                                                        }}
                                                                    >
                                                                        Verify
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {session.verified && (
                                                                <div>
                                                                    <span className="icon">
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faCheckCircle
                                                                            }
                                                                            className="has-text-success"
                                                                        ></FontAwesomeIcon>
                                                                    </span>
                                                                </div>
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
                    )}
                />
                <Route
                    exact
                    path={routes.MESSAGING + "/:userID/verify/:sessionID"}
                    render={({ match }) => {
                        const session =
                            sessions[match.params.userID][
                                match.params.sessionID
                            ];

                        if (session === undefined) {
                            return <span />;
                        }

                        const client = window.vex;
                        const mnemonic = client.sessions.verify(session);

                        return (
                            <div className="pane-screen-wrapper">
                                <div
                                    className="panel is-danger"
                                    key={session.sessionID}
                                >
                                    <p className="panel-heading">
                                        Verify Session with {familiar.username}
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
                                                    icon={faExclamationTriangle}
                                                    className="has-text-danger"
                                                />
                                            </span>
                                            &nbsp;
                                            {familiar.username} is using an
                                            unverified session.
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
                                            &nbsp; Verify with the other user
                                            that the words match.
                                        </p>
                                    </div>
                                    <div className="panel-block">
                                        <p>
                                            <span className="icon">
                                                <FontAwesomeIcon
                                                    icon={faTimes}
                                                    className="has-text-danger"
                                                />
                                            </span>
                                            &nbsp; DON&apos;T use vex to
                                            communicate the words.
                                        </p>
                                    </div>
                                    <div className="panel-block">
                                        <p>
                                            <span className="icon">
                                                <FontAwesomeIcon
                                                    icon={faSkull}
                                                />
                                            </span>
                                            &nbsp; If they don&apos;t match, you
                                            could be getting pwned. &nbsp;
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
                                                ref={messageThreeRef}
                                                data-event={"disabled"}
                                                data-multiline={true}
                                                onClick={() => {
                                                    const {
                                                        sessionID,
                                                    } = match.params;

                                                    client.sessions.markVerified(
                                                        sessionID
                                                    );
                                                    const action = markSession(
                                                        params.userID,
                                                        sessionID,
                                                        true
                                                    );

                                                    dispatch(action);

                                                    const forwardPath = query.get(
                                                        "forward"
                                                    );

                                                    if (forwardPath) {
                                                        history.push(
                                                            forwardPath
                                                        );
                                                        return;
                                                    }
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
                            </div>
                        );
                    }}
                />
                <Route
                    exact
                    path={routes.MESSAGING + "/:userID"}
                    render={() => {
                        const startMessages: ISerializedMessage[] = [
                            {
                                timestamp: new Date(Date.now()).toString(),
                                sender: user.userID,
                                recipient: user.userID,
                                direction: "incoming",
                                nonce: XUtils.encodeHex(nacl.randomBytes(24)),
                                message: "Welcome to vex messenger!",
                                decrypted: true,
                                mailID: uuid.v4(),
                                group: null,
                                failed: false,
                                failMessage: "",
                            },
                            {
                                timestamp: new Date(Date.now()).toString(),
                                sender: user.userID,
                                recipient: user.userID,
                                direction: "incoming",
                                nonce: XUtils.encodeHex(nacl.randomBytes(24)),
                                message:
                                    "This is a personal thread for taking notes, or whatever you'd like.",
                                decrypted: true,
                                mailID: uuid.v4(),
                                group: null,
                                failed: false,
                                failMessage: "",
                            },
                        ];

                        return (
                            <Fragment>
                                <div className="conversation-wrapper">
                                    {messageIDs.length === 0 &&
                                        params.userID === user.userID && (
                                            <div>
                                                <MessageBox
                                                    messages={startMessages}
                                                />
                                            </div>
                                        )}
                                    {chunkMessages(threadMessages || {}).map(
                                        (chunk) => {
                                            return (
                                                <MessageBox
                                                    key={
                                                        chunk[0]?.mailID ||
                                                        uuid.v4()
                                                    }
                                                    messages={chunk}
                                                />
                                            );
                                        }
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="chat-input-wrapper">
                                    <textarea
                                        value={inputValue}
                                        className="textarea chat-input has-fixed-size is-focused"
                                        onChange={(event) => {
                                            dispatch(
                                                addInputState(
                                                    params.userID,
                                                    event.target.value
                                                )
                                            );
                                        }}
                                        onKeyDown={async (event) => {
                                            if (
                                                event.key === "Enter" &&
                                                !event.shiftKey
                                            ) {
                                                event.preventDefault();

                                                const messageText = inputValue;
                                                dispatch(
                                                    addInputState(
                                                        params.userID,
                                                        ""
                                                    )
                                                );

                                                const client = window.vex;
                                                try {
                                                    await client.messages.send(
                                                        familiar.userID,
                                                        messageText
                                                    );
                                                } catch (err) {
                                                    console.log(err);
                                                    if (err.message) {
                                                        console.log(err);
                                                        dispatch(
                                                            failMessage(
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
                    }}
                ></Route>
            </Switch>
        </div>
    );
}
