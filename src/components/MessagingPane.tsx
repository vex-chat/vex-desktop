import type { IUser } from "@vex-chat/libvex";

import {
    faApple,
    faLinux,
    faWindows,
} from "@fortawesome/free-brands-svg-icons";
import {
    faArrowAltCircleDown,
    faAt,
    faCheckCircle,
    faEnvelopeOpenText,
    faExclamationCircle,
    faExclamationTriangle,
    faLock,
    faMobile,
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
import { del as delDevice, selectDevices } from "../reducers/devices";
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
import { Modal } from "./Modal";
import { msgify } from "./ServerPane";
import Settings from "./Settings";

export const DM_HISTORY_NAME = "DIRECT-MESSAGING";

export default function MessagingPane(props: {
    outboxMessages: string[];
    setOutboxMessages: (arr: string[]) => void;
}): JSX.Element {
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
                                            <table className="table is-fullwidth">
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
                                            {
                                                ...threadMessages,
                                                ...msgify(props.outboxMessages),
                                            } || {}
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

                                {!scrollLock && (
                                    <div className="conversation-fab">
                                        <FontAwesomeIcon
                                            icon={faArrowAltCircleDown}
                                            onClick={() => {
                                                scrollToBottom();
                                                setScrollLock(true);
                                            }}
                                        />
                                    </div>
                                )}

                                <ChatInput
                                    targetID={familiar.userID}
                                    userBarOpen={false}
                                    disabled={!directMessagesEnabled}
                                    outboxMessages={props.outboxMessages}
                                    setOutboxMessages={props.setOutboxMessages}
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
    const dispatch = useDispatch();

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState("");
    const [errText, setErrText] = useState("There was an error!");

    return (
        <div className="pane-screen-wrapper">
            <Modal
                showCancel
                active={confirmDelete}
                close={() => {
                    setSelectedDevice("");
                    setConfirmDelete(false);
                }}
                onAccept={async () => {
                    const client = window.vex;
                    try {
                        await client.devices.delete(selectedDevice);
                    } catch (err) {
                        setErrText(err.toString());
                        return;
                    }
                    dispatch(delDevice(devices[selectedDevice]));
                }}
            >
                <div>
                    <h1 className="title">Warning!</h1>
                    <p>
                        Are you sure you wish to remove this device from your
                        account? It will stop receiving messages until you log
                        in on it again, and you may lose your message history on
                        that device.
                    </p>
                </div>
            </Modal>
            <div className="message">
                <div className="message-header">Devices</div>
                <div className="message-body">
                    {errText !== "" && (
                        <div className="notification is-danger">
                            {errText}{" "}
                            <button
                                className="delete"
                                onClick={() => {
                                    setErrText("");
                                }}
                            ></button>
                        </div>
                    )}
                    <table className="table is-fullwidth">
                        <thead className="">
                            <tr>
                                <td />
                                <td>Device</td>
                                <td>Last Login</td>
                                <td />
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(devices)
                                .sort((a, b) => {
                                    const keyA = new Date(
                                        devices[a].lastLogin
                                    ).getTime();
                                    const keyB = new Date(
                                        devices[b].lastLogin
                                    ).getTime();
                                    if (keyA > keyB) return -1;
                                    if (keyA < keyB) return 1;
                                    return 0;
                                })
                                .map((key) => (
                                    <tr
                                        key={devices[key].deviceID}
                                        className=""
                                    >
                                        <td>
                                            <span className="icon">
                                                {getIcon(devices[key].name)}
                                            </span>
                                        </td>
                                        <td>{devices[key].name}</td>
                                        <td>
                                            last logged in{" "}
                                            {format(
                                                new Date(
                                                    devices[key].lastLogin
                                                ),
                                                "kk:mm MM/dd/yyyy"
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="button is-danger is-small"
                                                onClick={() => {
                                                    setSelectedDevice(
                                                        devices[key].deviceID
                                                    );
                                                    setConfirmDelete(true);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const getIcon = (name: string) => {
    switch (name) {
        case "win32":
            return <FontAwesomeIcon icon={faWindows} />;
        case "linux":
            return <FontAwesomeIcon icon={faLinux} />;
        case "darwin":
            return <FontAwesomeIcon icon={faApple} />;
        default:
            return <FontAwesomeIcon icon={faMobile} />;
    }
};
