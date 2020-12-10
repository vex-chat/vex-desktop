import { faCheck, faTimes, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Client } from "@vex-chat/vex-js";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { client } from "../Base";
import { selectInputs, setInputState } from "../reducers/inputs";
import { alertFX } from "./Sidebar";

const FORM_NAME = "register_component";

export default function IRegister(): JSX.Element {
    const dispatch = useDispatch();
    const inputs = useSelector(selectInputs);

    const [valid, setValid] = useState(false);
    const [taken, setTaken] = useState(false);
    const [waiting, setWaiting] = useState(false);

    const value = inputs[FORM_NAME + "-username"] || "";

    return (
        <div className="Aligner full-size">
            <div className="Aligner-item Aligner-item--top"></div>
            <div className="Aligner-item">
                <div className="box has-background-white register-form">
                    <div className="field">
                        <label className="label is-small">
                            Just pick a username:{" "}
                            {taken && (
                                <span className="has-text-danger">
                                    Username is taken!
                                </span>
                            )}{" "}
                        </label>
                        <p className="control has-icons-left has-icons-right">
                            <input
                                className="username-input input"
                                type="username"
                                value={value}
                                onChange={async (event) => {
                                    dispatch(
                                        setInputState(
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
                        </p>
                        <p className="control button-container">
                            <div className="buttons register-form-buttons is-right">
                                <button
                                    className={`button is-light${
                                        waiting ? " is-disabled" : ""
                                    }`}
                                    onClick={() => {
                                        dispatch(
                                            setInputState(
                                                FORM_NAME + "-username",
                                                Client.randomUsername()
                                            )
                                        );
                                    }}
                                >
                                    Random
                                </button>
                                <button
                                    className={`button is-success${
                                        waiting ? " is-loading" : ""
                                    }`}
                                    onClick={async () => {
                                        setWaiting(true);
                                        const username = value;

                                        // eslint-disable-next-line prefer-const
                                        let [user, err] = await client.register(
                                            username
                                        );
                                        if (!user) {
                                            console.warn(
                                                "registration failed.",
                                                err
                                            );
                                            return;
                                        }

                                        if (!err) {
                                            setWaiting(true);
                                            const err = await client.login();
                                            if (!err) {
                                                alertFX.play();
                                            }
                                        } else {
                                            console.error(err);
                                        }
                                    }}
                                >
                                    Chat
                                </button>
                            </div>
                        </p>
                    </div>
                </div>
            </div>
            <div className="Aligner-item Aligner-item--bottom"></div>
        </div>
    );
}
