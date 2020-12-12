import { faCheck, faTimes, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Client } from "@vex-chat/vex-js";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addInputState, resetInputStates } from "../reducers/inputs";
import { errorFX, switchFX } from "../views/Base";
import { useHistory } from "react-router";
import { routes } from "../constants/routes";
import { progFolder, client } from "../components/ClientLauncher";
import { resetUser } from "../reducers/user";
import { resetApp } from "../reducers/app";
import { resetMessages } from "../reducers/messages";
import { selectClassNames } from "../reducers/classNames";

const FORM_NAME = "register_component";

export default function IRegister(): JSX.Element {
    const dispatch = useDispatch();

    const classNames = useSelector(selectClassNames);

    const history = useHistory();

    const [valid, setValid] = useState(false);
    const [taken, setTaken] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [errorText, setErrorText] = useState("");

    const value = classNames[FORM_NAME + "-username"] || "";

    useEffect(() => {
        if ((classNames[FORM_NAME + "-username"] || "").length > 2) {
            setValid(true);
        } else {
            setValid(false);
        }
    });

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
                            Just pick a username:{" "}
                            {taken && (
                                <span className="has-text-danger">
                                    Username is taken!
                                </span>
                            )}
                            <br />
                        </label>
                        <div className="control input-wrapper has-icons-left has-icons-right">
                            <input
                                className="username-input input"
                                type="username"
                                value={value}
                                onChange={async (event) => {
                                    setErrorText("");
                                    setTaken(false);
                                    setValid(false);

                                    dispatch(
                                        addInputState(
                                            FORM_NAME + "-username",
                                            event.target.value
                                        )
                                    );

                                    if (event.target.value.length > 2) {
                                        setValid(true);
                                    } else {
                                        setValid(false);
                                    }

                                    const serverResults = await client.users.retrieve(
                                        event.target.value
                                    );
                                    if (serverResults) {
                                        setTaken(true);
                                    } else {
                                        setTaken(false);
                                    }
                                }}
                                placeholder="Username"
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
                        <div className="control button-container">
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
                                                FORM_NAME + "-username",
                                                username
                                            )
                                        );

                                        const serverResults = await client.users.retrieve(
                                            username
                                        );

                                        if (username.length > 2) {
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
                                    }`}
                                    onClick={async () => {
                                        switchFX.play();
                                        setWaiting(true);

                                        await client.close();
                                        dispatch(resetUser);
                                        dispatch(resetApp);
                                        dispatch(resetInputStates);
                                        dispatch(resetMessages);
                                        dispatch(resetUser);

                                        const PK = Client.generateSecretKey();
                                        localStorage.setItem("PK", PK);

                                        const tempClient = new Client(PK, {
                                            dbFolder: progFolder,
                                        });
                                        tempClient.on("ready", async () => {
                                            const username = value;
                                            // eslint-disable-next-line prefer-const
                                            const [
                                                user,
                                                err,
                                            ] = await tempClient.register(
                                                username
                                            );

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
            </div>
            <div className="Aligner-item Aligner-item--bottom"></div>
        </div>
    );
}
