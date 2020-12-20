import React, { useMemo, useState } from "react";
import { Switch, Route, Redirect, useHistory, Link } from "react-router-dom";
import { routes } from "../constants/routes";
import App from "../views/App";
import Register, { backButton } from "../views/Register";
import Settings from "../views/Settings";
import { remote } from "electron";
import fs from "fs";
import closeIcon from "../assets/icons/close.svg";
import minimizeIcon from "../assets/icons/minimize.svg";
import maximizeIcon from "../assets/icons/maximize.svg";
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
import { addInputState, selectInputStates } from "../reducers/inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import Loading from "../components/Loading";

export const gaurdian = new KeyGaurdian();

export const switchFX = new Audio("assets/sounds/switch_005.ogg");
switchFX.load();

export const errorFX = new Audio("assets/sounds/error_008.ogg");
errorFX.load();

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
    const dispatch = useDispatch();

    const unlockKey = () => {
        try {
            gaurdian.load(keyFolder + "/" + publicKey, inputs[FORM_NAME]);
        } catch (err) {
            console.error(err);
            return;
        }

        history.push(routes.HOME);
    };

    return (
        <VerticalAligner top={backButton()}>
            <div className="box">
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
                    <button className="button is-success" onClick={unlockKey}>
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
        window.maximize();
    }

    return (
        <div className="title-bar">
            {process.platform !== "darwin" && (
                <div className="window-buttons">
                    <span
                        onClick={() => minimizeWindow()}
                        className="pointer icon is-small minimize-button "
                    >
                        <img
                            src={(minimizeIcon as unknown) as string}
                            className="window-button-icon"
                        />
                    </span>
                    <span
                        onClick={() => maximizeWindow()}
                        className="icon maximize-button is-small has-text-danger pointer"
                    >
                        <img
                            src={(maximizeIcon as unknown) as string}
                            className="window-button-icon pointer"
                        />
                    </span>
                    <span
                        onClick={() => closeWindow()}
                        className="icon close-button is-small has-text-danger pointer"
                    >
                        <img
                            src={(closeIcon as unknown) as string}
                            className="window-button-icon"
                        />
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
