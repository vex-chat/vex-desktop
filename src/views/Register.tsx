import { Client } from "@vex-chat/libvex";

import { faCheck, faTimes, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";

import { VerticalAligner } from "../components/VerticalAligner";
import { dbFolder, keyFolder } from "../constants/folders";
import { routes } from "../constants/routes";
import { addInputState, selectInputStates } from "../reducers/inputs";
import gaurdian from "../utils/KeyGaurdian";

const USERNAME_INPUT_NAME = "register_username";
const PASSWORD_INPUT_NAME = "register_password";
const CONFIRM_INPUT_NAME = "register_confirmpass";

export default function Register(): JSX.Element {
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

    const registerUser = async () => {
        if (password.length === 0) {
            return;
        }

        if (password !== passConfirm) {
            return;
        }

        // switchFX.play();
        setWaiting(true);

        const PK = Client.generateSecretKey();
        const client = await Client.create(PK, {
            dbFolder,
            logLevel: "info",
        });

        // eslint-disable-next-line prefer-const
        const [user, err] = await client.register(username, password);

        if (err !== null) {
            // errorFX.play();
            setWaiting(false);
            console.warn("registration failed.", err);
            setErrorText(err.toString());
        }

        if (user !== null) {
            const keyPath = keyFolder + "/" + user.username;
            Client.saveKeyFile(keyPath, "", PK);

            try {
                const confirm = Client.loadKeyFile(keyPath, "");
                if (confirm !== PK) {
                    console.log(confirm, PK);
                    throw new Error(
                        "Key file that was written to disk is corrupt."
                    );
                }
            } catch (err) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                const errText = `Failed to save the keyfile to disk: ${err.toString()}`;
                setErrorText(errText);
                setWaiting(false);
                return;
            }
            gaurdian.load(keyPath, "");
            setWaiting(false);
            const err = await client.login(username, password);
            if (err) {
                throw err;
            }
            window.vex = client;
            history.push(routes.LAUNCH);
        }
    };

    return (
        <VerticalAligner>
            <div className="box has-background-white register-form">
                <div className="field">
                    <label className="label is-small">
                        Username: &nbsp;&nbsp;
                        <a
                            onClick={async () => {
                                setErrorText("");
                                setTaken(false);
                                setValid(false);

                                const username = Client.randomUsername();

                                dispatch(
                                    addInputState(USERNAME_INPUT_NAME, username)
                                );

                                const tempClient = await Client.create(
                                    undefined,
                                    {
                                        dbFolder,
                                    }
                                );

                                const [
                                    serverResults,
                                    err,
                                ] = await tempClient.users.retrieve(username);

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
                            random
                        </a>
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
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    registerUser();
                                }
                            }}
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

                                const tempClient = await Client.create(
                                    undefined,
                                    {
                                        dbFolder,
                                    }
                                );
                                const [user] = await tempClient.users.retrieve(
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
                            <FontAwesomeIcon icon={taken ? faTimes : faCheck} />
                        </span>
                    </div>
                    {errorText !== "" && (
                        <span className="help has-text-white has-text-bold notification is-danger has-delete">
                            {errorText}
                        </span>
                    )}
                </div>
                <div className="field">
                    <label className="label is-small">Password:</label>
                    <input
                        className="password-input input"
                        type="password"
                        value={password}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                registerUser();
                            }
                        }}
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
                            password !== passConfirm ? "is-danger" : ""
                        }`}
                        type="password"
                        value={passConfirm}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                registerUser();
                            }
                        }}
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
                            className={`button is-success${
                                waiting ? " is-loading" : ""
                            } `}
                            disabled={
                                password !== passConfirm || password.length < 3
                            }
                            onClick={registerUser}
                        >
                            Chat
                        </button>
                    </div>
                </div>
            </div>
        </VerticalAligner>
    );
}
