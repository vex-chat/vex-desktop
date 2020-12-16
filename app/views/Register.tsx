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
import { routes } from "../constants/routes";
import { progFolder } from "../components/ClientLauncher";
import { resetUser } from "../reducers/user";
import { resetApp } from "../reducers/app";
import { resetMessages } from "../reducers/messages";
import { resetGroupMessages } from "../reducers/groupMessages";

const FORM_NAME = "register_username";

export default function IRegister(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();

    const [valid, setValid] = useState(false);
    const [taken, setTaken] = useState(false);

    const inputs = useSelector(selectInputStates);

    const value = inputs[FORM_NAME] || "";

    const [waiting, setWaiting] = useState(false);
    const [errorText, setErrorText] = useState("");

    useEffect(() => {
        if (value.length > 2 && value.length < 20) {
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
                                value={value}
                                onChange={async (event) => {
                                    setErrorText("");
                                    setTaken(false);
                                    setValid(false);

                                    dispatch(
                                        addInputState(
                                            FORM_NAME,
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
                                            addInputState(FORM_NAME, username)
                                        );

                                        const client = window.vex;

                                        const [
                                            serverResults,
                                            err,
                                        ] = await client.users.retrieve(
                                            username
                                        );

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
                                    }`}
                                    onClick={async () => {
                                        switchFX.play();
                                        setWaiting(true);
                                        const client = window.vex;
                                        await client.close();
                                        dispatch(resetUser);
                                        dispatch(resetApp);
                                        dispatch(resetInputStates);
                                        dispatch(resetMessages);
                                        dispatch(resetUser);
                                        dispatch(resetGroupMessages);

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
