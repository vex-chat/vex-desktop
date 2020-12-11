import { faCheck, faTimes, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Client, IMessage, ISession, IUser } from "@vex-chat/vex-js";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectInputStates, addInputState } from "../reducers/inputs";
import { alertFX } from "../components/Sidebar";
import { client, IDisplayMessage, initClient } from "../views/Base";
import { useHistory } from "react-router";
import { setUser } from "../reducers/user";
import { addSession, setSessions } from "../reducers/sessions";
import { addFamiliar, setFamiliars } from "../reducers/familiars";
import { addMessage } from "../reducers/messages";
import { remote } from "electron";
import { routes } from "../constants/routes";

const FORM_NAME = "register_component";

export default function IRegister(): JSX.Element {
    const dispatch = useDispatch();
    const inputs = useSelector(selectInputStates);

    const history = useHistory();

    const [valid, setValid] = useState(false);
    const [taken, setTaken] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [errorText, setErrorText] = useState("");

    const value = inputs[FORM_NAME + "-username"] || "";

    useEffect(() => {
        if ((inputs[FORM_NAME + "-username"] || "").length > 2) {
            setValid(true);
        } else {
            setValid(false);
        }
    });

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
                            )}
                            <br />
                        </label>
                        <div className="control input-wrapper has-icons-left has-icons-right">
                            <input
                                className="username-input input"
                                type="username"
                                value={value}
                                onChange={async (event) => {
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
                                        setWaiting(true);

                                        const PK = Client.generateSecretKey();
                                        localStorage.setItem("PK", PK);

                                        initClient();

                                        client.on("authed", async () => {
                                            const me = client.users.me();
                                            dispatch(setUser(me));

                                            history.push(
                                                "/messaging/" + me.userID
                                            );

                                            const conversations = await client.conversations.retrieve();
                                            dispatch(
                                                setSessions(conversations)
                                            );

                                            const familiars = await client.familiars.retrieve();
                                            dispatch(setFamiliars(familiars));

                                            for (const user of familiars) {
                                                const history = await client.messages.retrieve(
                                                    user.userID
                                                );
                                                for (const message of history) {
                                                    dispatch(
                                                        addMessage(message)
                                                    );
                                                }
                                            }
                                        });

                                        client.on(
                                            "conversation",
                                            async (
                                                conversation: ISession,
                                                user: IUser
                                            ) => {
                                                dispatch(
                                                    addSession(conversation)
                                                );
                                                dispatch(addFamiliar(user));
                                            }
                                        );

                                        client.on(
                                            "message",
                                            async (message: IMessage) => {
                                                const dispMsg: IDisplayMessage = {
                                                    message: message.message,
                                                    recipient:
                                                        message.recipient,
                                                    nonce: message.nonce,
                                                    timestamp:
                                                        message.timestamp,
                                                    sender: message.sender,
                                                    direction:
                                                        message.direction,
                                                };
                                                dispatch(addMessage(dispMsg));

                                                if (
                                                    dispMsg.direction ===
                                                        "incoming" &&
                                                    message.recipient !==
                                                        message.sender
                                                ) {
                                                    const msgNotification = new Notification(
                                                        "Vex",
                                                        {
                                                            body:
                                                                message.message,
                                                        }
                                                    );

                                                    msgNotification.onclick = () => {
                                                        remote
                                                            .getCurrentWindow()
                                                            .show();
                                                        history.push(
                                                            routes.MESSAGING +
                                                                "/" +
                                                                (dispMsg.direction ===
                                                                "incoming"
                                                                    ? dispMsg.sender
                                                                    : dispMsg.recipient)
                                                        );
                                                    };
                                                }
                                            }
                                        );

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
                                            setWaiting(false);
                                            if (err) {
                                                setErrorText(err.toString());
                                            }
                                            return;
                                        }

                                        if (!err) {
                                            setWaiting(true);
                                            const err = await client.login();
                                            if (!err) {
                                                alertFX.play();
                                                history.push(
                                                    "/messaging/" +
                                                        client.users.me().userID
                                                );
                                            }
                                        } else {
                                            setWaiting(false);
                                            setErrorText(err.toString());
                                            console.error(err);
                                        }
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
