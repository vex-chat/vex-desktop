import React, { useMemo, useState } from "react";
import { Switch, Route, Redirect, useHistory, Link } from "react-router-dom";
import { routes } from "../constants/routes";
import App from "../views/App";
import Register, { backButton } from "../views/Register";
import Settings from "../views/Settings";
import { remote } from "electron";
import fs from "fs";
import {
    ClientLauncher,
    dbFolder,
    keyFolder,
} from "../components/ClientLauncher";
import CreateServer from "../components/CreateServer";
import Messaging from "./Messaging";
import { Server } from "./Server";
import { KeyGaurdian } from "../utils/KeyGaurdian";
import { Client, IUser } from "@vex-chat/vex-js";
import { IconUsername } from "../components/IconUsername";
import { useQuery } from "../components/MessagingPane";
import { useDispatch, useSelector } from "react-redux";
import {
    addInputState,
    resetInputStates,
    selectInputStates,
} from "../reducers/inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLock,
    faTimes,
    faWindowMaximize,
    faWindowMinimize,
} from "@fortawesome/free-solid-svg-icons";
import Loading from "../components/Loading";
import Store from "electron-store";
import { version } from "../package.json";
import { resetApp } from "../reducers/app";
import { resetChannels } from "../reducers/channels";
import { resetFamiliars } from "../reducers/familiars";
import { resetGroupMessages } from "../reducers/groupMessages";
import { resetMessages } from "../reducers/messages";
import { resetServers } from "../reducers/servers";
import { resetSessions } from "../reducers/sessions";
import { resetUser } from "../reducers/user";
import { resetPermissions } from "../reducers/permissions";

export const gaurdian = new KeyGaurdian();

export const switchFX = new Audio("assets/sounds/switch_005.ogg");
switchFX.load();

export const errorFX = new Audio("assets/sounds/error_008.ogg");
errorFX.load();

export const dataStore = new Store();

export default function Base(): JSX.Element {
    return (
        <App>
            <TitleBar />
            <Switch>
                <Route
                    path={routes.MESSAGING + "/:userID?/:page?/:sessionID?"}
                    render={() => <Messaging />}
                />
                <Route
                    path={routes.SERVERS + "/:serverID?/:channelID?"}
                    render={({ match }) => <Server match={match} />}
                />
                <Route path={routes.REGISTER} render={() => <Register />} />
                <Route path={routes.SETTINGS} render={() => <Settings />} />
                <Route path={routes.LAUNCH} render={() => <ClientLauncher />} />
                <Route
                    path={routes.CREATE + "/:resourceType?"}
                    render={({ match }) => {
                        switch (match.params.resourceType) {
                            case "server":
                                return <CreateServer />;
                            default:
                                console.warn(
                                    "Unsupported resource type for create route" +
                                        match.params.resourceType
                                );
                                return;
                        }
                    }}
                />
                <Route path={routes.LOGIN} render={() => <LoginForm />} />
                <Route path={routes.LOGOUT} render={() => <Logout />} />
                <Route
                    exact
                    path={routes.HOME}
                    render={() => {
                        if (gaurdian.hasKey()) {
                            return <Redirect to={routes.LAUNCH} />;
                        } else {
                            return <IdentityPicker />;
                        }
                    }}
                />
            </Switch>
        </App>
    );
}

export function LoginForm(): JSX.Element {
    const history = useHistory();
    const FORM_NAME = "keyfile-login-pasword";
    const query = useQuery();
    const inputs = useSelector(selectInputStates);
    const publicKey = query.get("key");
    const [loading, setLoading] = useState(false);
    const [errText, setErrText] = useState("");
    const dispatch = useDispatch();

    const unlockKey = () => {
        const password = inputs[FORM_NAME];

        if (!password || password == "") {
            return;
        }
        setLoading(true);
        dispatch(addInputState(FORM_NAME, ""));
        try {
            gaurdian.load(keyFolder + "/" + publicKey, password);
        } catch (err) {
            console.error(err);
            setErrText(err.toString());
            setLoading(false);
            return;
        }
        history.push(routes.HOME);
    };

    return (
        <VerticalAligner top={backButton()}>
            <div className="box">
                {errText !== "" && (
                    <div className="notification is-danger">{errText}</div>
                )}
                <label className="label is-small">Password:</label>
                <div className="control input-wrapper has-icons-left has-icons-right">
                    <input
                        className="input"
                        type="password"
                        placeholder="hunter2"
                        value={inputs[FORM_NAME] || ""}
                        onChange={(event) => {
                            dispatch(
                                addInputState(FORM_NAME, event.target.value)
                            );
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                unlockKey();
                            }
                        }}
                    />
                    <span className="icon is-left">
                        <FontAwesomeIcon icon={faLock} />
                    </span>
                </div>
                <div className="buttons is-right">
                    <button
                        className={`button is-success ${
                            loading ? "is-loading" : ""
                        }`}
                        onClick={unlockKey}
                    >
                        Unlock
                    </button>
                </div>
            </div>
        </VerticalAligner>
    );
}

export function IdentityPicker(): JSX.Element {
    const pubkeyRegex = /[0-9a-f]{64}/;

    const initialState: Record<string, IUser> = {};
    const [initialLoad, setInitialLoad] = useState(true);
    // const [errText, setErrText] = useState("");
    const [accounts, setAccounts] = useState(initialState);
    const history = useHistory();

    useMemo(async () => {
        const keyFiles = fs.readdirSync(keyFolder);
        const tempClient = new Client(undefined, { dbFolder });
        const accs: Record<string, IUser> = {};
        for (const keyFile of keyFiles) {
            if (!pubkeyRegex.test(keyFile)) {
                continue;
            }

            // filename is public key
            const [user, err] = await tempClient.users.retrieve(keyFile);
            if (err) {
                console.warn(err);
                continue;
            }
            if (user) {
                accs[user.signKey] = user;
            }
        }
        setAccounts(accs);
        setInitialLoad(false);
    }, [history]);

    if (initialLoad) {
        return <Loading size={256} animation={"cylon"} />;
    }

    if (!initialLoad && Object.keys(accounts).length === 0) {
        history.push(routes.REGISTER);
    }

    return (
        <VerticalAligner>
            <p className="title">Local Identities</p>
            <p className="subtitle">Which identity would you like to use?</p>

            <div className="panel is-light identity-panel">
                {Object.keys(accounts).length > 0 &&
                    Object.keys(accounts).map((key) => (
                        <div key={key} className="panel-block identity-link">
                            <span
                                className="identity-link"
                                onClick={() => {
                                    history.push(routes.LOGIN + "?key=" + key);
                                }}
                            >
                                {IconUsername(accounts[key])}
                            </span>
                        </div>
                    ))}
            </div>

            <div className="buttons is-right">
                <Link to={routes.REGISTER} className="button">
                    New Identity
                </Link>
            </div>
        </VerticalAligner>
    );
}

export function TitleBar(): JSX.Element {
    function closeWindow() {
        const window = remote.getCurrentWindow();
        window.close();
    }

    function minimizeWindow() {
        console.log("reached");
        const window = remote.getCurrentWindow();
        window.minimize();
    }

    function maximizeWindow() {
        const window = remote.getCurrentWindow();

        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    }

    return (
        <div className="title-bar" onDoubleClick={maximizeWindow}>
            <div className="title-bar-grabber has-text-centered is-size-7">
                vex desktop {version}
            </div>
            {process.platform !== "darwin" && (
                <div className="window-buttons">
                    <span
                        onClick={() => minimizeWindow()}
                        className="pointer icon is-small minimize-button "
                    >
                        <FontAwesomeIcon icon={faWindowMinimize} />
                    </span>
                    <span
                        onClick={() => maximizeWindow()}
                        className="icon maximize-button is-small pointer"
                    >
                        <FontAwesomeIcon icon={faWindowMaximize} />
                    </span>
                    <span
                        onClick={() => closeWindow()}
                        className="icon close-button has-text-danger is-small pointer"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </div>
            )}
        </div>
    );
}

export function VerticalAligner(props: {
    top?: JSX.Element;
    bottom?: JSX.Element;
    children: React.ReactNode;
}): JSX.Element {
    return (
        <div className="Aligner full-size">
            <div className="Aligner-item Aligner-item--top">
                {props.top ? props.top : <span />}
            </div>
            <div className="Aligner-item">{props.children}</div>
            <div className="Aligner-item Aligner-item--bottom">
                {props.bottom ? props.bottom : <span />}
            </div>
        </div>
    );
}

export function Logout(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();
    const query = useQuery();

    const logout = async () => {
        const client = window.vex;
        await client.close();

        if (query.get("clear") !== "off") {
            gaurdian.clear();
        } else {
            console.log(
                "clear set to off explicitly, keeping keys in gaurdian."
            );
        }

        dispatch(resetApp());
        dispatch(resetChannels());
        dispatch(resetFamiliars());
        dispatch(resetGroupMessages());
        dispatch(resetInputStates());
        dispatch(resetMessages());
        dispatch(resetServers());
        dispatch(resetSessions());
        dispatch(resetUser());
        dispatch(resetPermissions());

        history.push(query.get("forward") || routes.HOME);
    };

    useMemo(() => logout(), []);

    return <div />;
}
