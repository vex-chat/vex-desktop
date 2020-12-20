import { faCheck, faTimes, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Client } from "@vex-chat/vex-js";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addInputState,
    resetInputStates,
    selectInputStates,
} from "../reducers/inputs";
import { errorFX, switchFX } from "../views/Base";
import { useHistory } from "react-router";
import { dbFolder, keyFolder, progFolder } from "../components/ClientLauncher";
import { resetUser } from "../reducers/user";
import { resetApp } from "../reducers/app";
import { resetMessages } from "../reducers/messages";
import { resetGroupMessages } from "../reducers/groupMessages";
import { resetChannels } from "../reducers/channels";
import { resetFamiliars } from "../reducers/familiars";
import { resetServers } from "../reducers/servers";
import { resetSessions } from "../reducers/sessions";
import { resetPermissions } from "../reducers/permissions";
import { routes } from "../constants/routes";
import { loadKeyFile, saveKeyFile } from "../utils/KeyGaurdian";

const USERNAME_INPUT_NAME = "register_username";
const PASSWORD_INPUT_NAME = "register_password";
const CONFIRM_INPUT_NAME = "register_confirmpass";

export default function IRegister(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();

    const [valid, setValid] = useState(false);
    const [taken, setTaken] = useState(false);

    const inputs = useSelector(selectInputStates);

    const username = inputs[USERNAME_INPUT_NAME] || "";
    const password = inputs[PASSWORD_INPUT_NAME] || "";
    const passConfirm = inputs[CONFIRM_INPUT_NAME] || "";

    const [waiting, setWaiting] = useState(false);
    const [errorText, setErrorText] = useState("");

    useEffect(() => {
        if (username.length > 2 && username.length < 20) {
            setValid(true);
        } else {
            setValid(false);
        }
    });

    const resetClient = async () => {
        const client = window.vex;
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
        await client.close();
    };

    return (
        <div className="Aligner full-size">
            <div className="Aligner-item Aligner-item--top">
                <div className="Aligner-item Aligner-item--top">
                    <a
                        className="delete settings-delete is-medium"
                        onClick={() => {
                            history.goBack();
                        }}
                    ></a>
                </div>
            </div>
            <div className="Aligner-item">
                <div className="box has-background-white register-form">
                    <div className="field">
                        <label className="label is-small">
                            Pick a username:{" "}
                            {taken && (
                                <span className="has-text-danger">
                                    Username is taken!
                                </span>
                            )}
                            <br />
                        </label>
                        <div className="control input-wrapper has-icons-left has-icons-right">
                            <input
                                className="servername-input input"
                                type="username"
                                value={username}
                                onChange={async (event) => {
                                    setErrorText("");
                                    setTaken(false);
                                    setValid(false);

                                    dispatch(
                                        addInputState(
                                            USERNAME_INPUT_NAME,
                                            event.target.value
                                        )
                                    );

                                    if (
                                        event.target.value.length > 2 &&
                                        event.target.value.length < 20
                                    ) {
                                        setValid(true);
                                    } else {
                                        setValid(false);
                                    }

                                    const tempClient = new Client(undefined, {
                                        dbFolder: progFolder,
                                    });
                                    const [
                                        user,
                                    ] = await tempClient.users.retrieve(
                                        event.target.value
                                    );

                                    if (user !== null) {
                                        setTaken(true);
                                    }
                                }}
                                placeholder={Client.randomUsername()}
                            />
                            <span className="icon is-small is-left">
                                <FontAwesomeIcon icon={faUserAlt} />
                            </span>
                            <span
                                className={`icon is-small is-right${
                                    taken
                                        ? " has-text-danger"
                                        : valid
                                        ? " has-text-success"
                                        : ""
                                }`}
                            >
                                <FontAwesomeIcon
                                    icon={taken ? faTimes : faCheck}
                                />
                            </span>
                        </div>
                        {errorText !== "" && (
                            <span className="help has-text-white has-text-bold notification is-danger has-delete">
                                {errorText}
                            </span>
                        )}
                    </div>
                    <div className="field">
                        <label className="label is-small">
                            Password to encrypt your keys:
                        </label>
                        <input
                            className="password-input input"
                            type="password"
                            value={password}
                            onChange={(event) => {
                                dispatch(
                                    addInputState(
                                        PASSWORD_INPUT_NAME,
                                        event.target.value
                                    )
                                );
                            }}
                        />
                    </div>
                    <br />
                    <div className="field">
                        <label className="label is-small">
                            Confirm password:{" "}
                            {password !== passConfirm && (
                                <span className="has-text-danger">
                                    Does not match!
                                </span>
                            )}
                        </label>
                        <input
                            className={`password-input input ${
                                password !== passConfirm && "is-danger"
                            }`}
                            type="password"
                            value={passConfirm}
                            onChange={(event) => {
                                dispatch(
                                    addInputState(
                                        CONFIRM_INPUT_NAME,
                                        event.target.value
                                    )
                                );
                            }}
                        />
                    </div>

                    <br />

                    <div className="field">
                        <div className="buttons register-form-buttons is-right">
                            <button
                                className={`button is-light${
                                    waiting ? " is-disabled" : ""
                                }`}
                                onClick={async () => {
                                    setErrorText("");
                                    setTaken(false);
                                    setValid(false);

                                    const username = Client.randomUsername();

                                    dispatch(
                                        addInputState(
                                            USERNAME_INPUT_NAME,
                                            username
                                        )
                                    );

                                    const client = window.vex;

                                    const [
                                        serverResults,
                                        err,
                                    ] = await client.users.retrieve(username);

                                    if (
                                        err &&
                                        err.response &&
                                        err.response.status === 200
                                    ) {
                                        setTaken(true);
                                    }

                                    if (
                                        username.length > 2 &&
                                        username.length < 20
                                    ) {
                                        setValid(true);
                                    } else {
                                        setValid(false);
                                    }

                                    if (serverResults) {
                                        setTaken(true);
                                    } else {
                                        setTaken(false);
                                    }
                                }}
                            >
                                Random
                            </button>
                            <button
                                className={`button is-success${
                                    waiting ? " is-loading" : ""
                                } `}
                                disabled={
                                    password !== passConfirm ||
                                    password.length < 3
                                }
                                onClick={async () => {
                                    switchFX.play();
                                    setWaiting(true);

                                    const PK = Client.generateSecretKey();
                                    localStorage.setItem("PK", PK);

                                    const tempClient = new Client(PK, {
                                        dbFolder,
                                    });
                                    tempClient.on("ready", async () => {
                                        // eslint-disable-next-line prefer-const
                                        const [
                                            user,
                                            err,
                                        ] = await tempClient.register(username);

                                        await tempClient.close();

                                        if (err !== null) {
                                            errorFX.play();
                                            setWaiting(false);
                                            console.warn(
                                                "registration failed.",
                                                err
                                            );
                                            setErrorText(err.toString());
                                        }

                                        if (user !== null) {
                                            setWaiting(false);
                                            const keyPath =
                                                keyFolder + "/" + user.username;
                                            saveKeyFile(keyPath, password, PK);

                                            try {
                                                const confirm = loadKeyFile(
                                                    keyPath,
                                                    password
                                                );
                                                if (confirm !== PK) {
                                                    console.log(confirm, PK);
                                                    throw new Error(
                                                        "Key file that was written to disk is corrupt."
                                                    );
                                                }
                                            } catch (err) {
                                                setErrorText(
                                                    "Failed to save the keyfile to disk: " +
                                                        err.toString()
                                                );
                                                return;
                                            }

                                            await resetClient();
                                            history.push(routes.LAUNCH);
                                        }
                                    });
                                    tempClient.init();
                                }}
                            >
                                Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="Aligner-item Aligner-item--bottom"></div>
        </div>
    );
}
