import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Client, IServer } from "@vex-chat/vex";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { routes } from "../constants/routes";
import { addChannels } from "../reducers/channels";
import { addInputState, selectInputStates } from "../reducers/inputs";
import { addServer } from "../reducers/servers";

const FORM_NAME = "create-server";

export default function ICreateServer(): JSX.Element {
    const history = useHistory();
    const dispatch = useDispatch();
    const inputStates = useSelector(selectInputStates);

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
                            Pick a server name: <br />
                        </label>
                        <div className="control input-wrapper has-icons-left">
                            <input
                                className="servername-input input"
                                type="username"
                                placeholder={"My Cool Server"}
                                value={inputStates[FORM_NAME] || ""}
                                onChange={(event) => {
                                    dispatch(
                                        addInputState(
                                            FORM_NAME,
                                            event.target.value
                                        )
                                    );
                                }}
                            />
                            <span className="icon is-small is-left">
                                <FontAwesomeIcon icon={faServer} />
                            </span>
                            <span className="icon is-small is-right"></span>
                        </div>
                        <div className="control button-container">
                            <div className="buttons register-form-buttons is-right">
                                <button
                                    className="button is-success"
                                    onClick={async () => {
                                        if (
                                            !inputStates[FORM_NAME] ||
                                            inputStates[FORM_NAME] === ""
                                        ) {
                                            return;
                                        }
                                        const client: Client = window.vex;
                                        try {
                                            const server: IServer = await client.servers.create(
                                                inputStates[FORM_NAME]
                                            );
                                            const channels = await client.channels.retrieve(
                                                server.serverID
                                            );
                                            dispatch(addServer(server));
                                            dispatch(addChannels(channels));
                                            history.push(
                                                routes.SERVERS +
                                                    "/" +
                                                    server.serverID
                                            );
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                >
                                    Create
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
