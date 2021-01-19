import type { Client, IServer } from "@vex-chat/libvex";

import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import * as uuid from "uuid";

import { routes } from "../constants/routes";
import { addChannels } from "../reducers/channels";
import { setPermissions } from "../reducers/permissions";
import { addServer } from "../reducers/servers";

export function CreateServer(): JSX.Element {
    const history = useHistory();
    const dispatch = useDispatch();

    const [inputVal, setInputVal] = useState("");
    const [inviteVal, setInviteVal] = useState("");

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
                <div className="box register-form">
                    <div className="field">
                        <label className="label is-small">
                            Pick a server name: <br />
                        </label>
                        <div className="control input-wrapper has-icons-left">
                            <input
                                className="servername-input input"
                                type="username"
                                placeholder={"My Cool Server"}
                                value={inputVal}
                                onChange={(event) => {
                                    setInputVal(event.target.value);
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
                                    className="button is-success is-small"
                                    onClick={async () => {
                                        if (inputVal.trim() === "") {
                                            return;
                                        }
                                        const client: Client = window.vex;
                                        try {
                                            const server: IServer = await client.servers.create(
                                                inputVal
                                            );
                                            const channels = await client.channels.retrieve(
                                                server.serverID
                                            );

                                            dispatch(addServer(server));
                                            dispatch(addChannels(channels));

                                            const newPermissions = await client.permissions.retrieve();
                                            dispatch(
                                                setPermissions(newPermissions)
                                            );

                                            history.push(
                                                routes.SERVERS +
                                                    "/" +
                                                    server.serverID +
                                                    "/channels"
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
                    <br />
                    <div className="field">
                        <label className="label is-small">
                            Or, enter an invite link/code:
                        </label>
                        <input
                            className="input has-icons-left"
                            type="text"
                            placeholder={
                                "https://vex.chat/invite/1c01eb5e-e9db-44a7-b137-3b5ee9cad364"
                            }
                            value={inviteVal}
                            onChange={(event) => {
                                setInviteVal(event.target.value);
                            }}
                        />

                        <br />
                        <br />
                        <div className="control button-container">
                            <div className="buttons register-form-buttons is-right">
                                <button
                                    className="button is-success is-small"
                                    onClick={async () => {
                                        const inviteID = inviteVal
                                            .split("/")
                                            .pop();
                                        if (
                                            inviteID &&
                                            uuid.validate(inviteID)
                                        ) {
                                            const client = window.vex;
                                            try {
                                                const permission = await client.invites.redeem(
                                                    inviteID
                                                );

                                                const serverInfo = await client.servers.retrieveByID(
                                                    permission.resourceID
                                                );
                                                if (!serverInfo) {
                                                    console.warn(
                                                        "Server info not found."
                                                    );
                                                    return;
                                                }

                                                const serverChannels = await client.channels.retrieve(
                                                    serverInfo.serverID
                                                );
                                                const newPermissions = await client.permissions.retrieve();

                                                dispatch(addServer(serverInfo));
                                                dispatch(
                                                    addChannels(serverChannels)
                                                );
                                                dispatch(
                                                    setPermissions(
                                                        newPermissions
                                                    )
                                                );

                                                history.push(
                                                    routes.SERVERS +
                                                        "/" +
                                                        permission.resourceID +
                                                        "/channels/" +
                                                        (serverChannels[0]
                                                            ?.channelID || "")
                                                );
                                            } catch (err) {
                                                console.warn(err.toString());
                                            }
                                        }
                                    }}
                                >
                                    Join
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
