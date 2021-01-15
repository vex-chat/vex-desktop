import type { IUser } from "@vex-chat/libvex";

import {
    faAt,
    faCheckCircle,
    faEnvelopeOpenText,
    faExclamationCircle,
    faExclamationTriangle,
    faLock,
    faSkull,
    faStar,
    faTimes,
    faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import {
    createRef,
    Fragment,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory, useParams } from "react-router";
import * as uuid from "uuid";

import { routes } from "../constants/routes";
import { useQuery } from "../hooks/useQuery";
import { selectDevices } from "../reducers/devices";
import { selectFamiliars } from "../reducers/familiars";
import { push as pushHistoryStack } from "../reducers/historyStacks";
import { selectMessages } from "../reducers/messages";
import { markSession, selectSessions } from "../reducers/sessions";
import { chunkMessages } from "../utils/chunkMessages";
import store from "../utils/DataStore";

import { ChatInput } from "./ChatInput";
import { FamiliarMenu } from "./FamiliarMenu";
import { Highlighter } from "./Highlighter";
import { IconUsername } from "./IconUsername";
import { MessageBox } from "./MessageBox";
import Settings from "./Settings";

export const DM_HISTORY_NAME = "DIRECT-MESSAGING";

export default function MessagingPane(): JSX.Element {
    // state

    const dispatch = useDispatch();
    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const history = useHistory();
    // url parameters
    const params: { userID: string; page: string | undefined } = useParams();

    const query = useQuery();

    const sessions = useSelector(selectSessions);

    const [scrollLock, setScrollLock] = useState(true);

    const directMessagesEnabled = store.get(
        "settings.directMessages"
    ) as boolean;

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
        if (scrollLock) {
            scrollToBottom();
        }
    });

    const familiar: IUser | undefined = familiars[params.userID];

    useMemo(() => {
        if (!params.page) {
            dispatch(
                pushHistoryStack({
                    serverID: DM_HISTORY_NAME,
                    path: history.location.pathname,
                })
            );
        }
    }, [history.location.pathname]);

    const allMessages = useSelector(selectMessages);
    const threadMessages = allMessages[params.userID];

    if (!familiar) {
        return (
            <div className="pane direct-messaging">
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
        <div className="pane direct-messaging">
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
                    path={routes.MESSAGING + "/:userID/settings"}
                    render={() => <Settings />}
                ></Route>
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
                                        className="button is-plain is-small t-12"
                                        onClick={() => {
                                            history.goBack();
                                        }}
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
                    path={routes.MESSAGING + "/:userID/devices"}
                    render={() => <DeviceList />}
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
                                        className="button is-plain is-small"
                                        onClick={() => {
                                            history.goBack();
                                        }}
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
                                                className="button is-plain is-right"
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

                                                    // TODO now that this is a promise decide on whether to await or void it
                                                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
                        return (
                            <Fragment>
                                {store.get("settings.directMessages") && (
                                    <div
                                        className="conversation-wrapper"
                                        onScroll={(event) => {
                                            const chatWindowHeight = (event.target as HTMLInputElement)
                                                .offsetHeight;
                                            const scrollHeight = (event.target as HTMLInputElement)
                                                .scrollHeight;
                                            const scrollTop = (event.target as HTMLInputElement)
                                                .scrollTop;
                                            const vScrollPosition =
                                                scrollHeight -
                                                (scrollTop + chatWindowHeight);

                                            if (vScrollPosition === 0) {
                                                setScrollLock(true);
                                            }

                                            if (vScrollPosition > 150) {
                                                setScrollLock(false);
                                            }
                                        }}
                                    >
                                        {params.userID !== undefined && (
                                            <div
                                                className={"history-disclaimer"}
                                            >
                                                <p className="help">
                                                    <FontAwesomeIcon
                                                        icon={faStar}
                                                    />{" "}
                                                    For your security, message
                                                    history is not transferred
                                                    to new devices.
                                                    <FontAwesomeIcon
                                                        icon={faStar}
                                                    />{" "}
                                                </p>
                                            </div>
                                        )}

                                        {chunkMessages(
                                            threadMessages || {}
                                        ).map((chunk) => {
                                            return (
                                                <MessageBox
                                                    key={
                                                        chunk[0]?.mailID ||
                                                        uuid.v4()
                                                    }
                                                    messages={chunk}
                                                />
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}

                                <ChatInput
                                    targetID={familiar.userID}
                                    className={"direct-messaging"}
                                    disabled={!directMessagesEnabled}
                                />
                            </Fragment>
                        );
                    }}
                ></Route>
            </Switch>
        </div>
    );
}

export function DeviceList(): JSX.Element {
    const params: { userID: string } = useParams();
    const devices = useSelector(selectDevices(params.userID));

    return (
        <div className="pane-screen-wrapper">
            <div className="message">
                <div className="message-header">Devices</div>
                <div className="message-body">
                    {Object.keys(devices).map((key) => (
                        <div key={devices[key].deviceID} className="help">
                            {devices[key].name}
                            &nbsp; &nbsp; last logged in{" "}
                            {format(
                                new Date(devices[key].lastLogin),
                                "kk:mm MM/dd/yyyy"
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
