import type { FunctionComponent } from "react";

import { Client } from "@vex-chat/libvex";

import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import isDev from "electron-is-dev";
import fs from "fs";
import { memo, useState } from "react";
import { useHistory } from "react-router";

import { VerticalAligner } from "../components";
import { dbFolder, errorFX, keyFolder, routes, unlockFX } from "../constants";
import { DataStore, gaurdian } from "../utils";

export const Login: FunctionComponent = memo(() => {
    const history = useHistory();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errText, setErrText] = useState("");

    const loginUser = async () => {
        if (DataStore.get("settings.sounds") as boolean) {
            await unlockFX.play();
        }
        if (password == "" || username == "") {
            if (unlockFX.duration > 0 && !unlockFX.paused) {
                unlockFX.pause();
                unlockFX.currentTime = 0;
            }
            if (DataStore.get("settings.sounds") as boolean) {
                await errorFX.play();
            }
            setErrText("All fields are required.");
            setLoading(false);
            return;
        }
        setLoading(true);
        const keyPath = keyFolder + "/" + username.toLowerCase();
        if (fs.existsSync(keyPath)) {
            gaurdian.load(keyPath);
        } else {
            gaurdian.setKey(Client.generateSecretKey());
        }
        const client = await Client.create(gaurdian.getKey(), {
            dbFolder,
            logLevel: isDev ? "info" : "warn",
        });
        const err = await client.login(username, password);
        if (err) {
            if (unlockFX.duration > 0 && !unlockFX.paused) {
                unlockFX.pause();
                unlockFX.currentTime = 0;
            }
            if (DataStore.get("settings.sounds") as boolean) {
                await errorFX.play();
            }
            setErrText(err.toString());
            setLoading(false);
            return;
        }
        if (!fs.existsSync(keyPath)) {
            Client.saveKeyFile(keyPath, "", gaurdian.getKey());
        }
        window.vex = client;
        history.push(routes.LAUNCH);
    };

    return (
        <VerticalAligner>
            <div className="login-register-box-wrapper">
                <div className="box login-box">
                    {errText !== "" && (
                        <div className="notification is-danger">
                            {" "}
                            <button
                                className="delete"
                                onClick={() => {
                                    setErrText("");
                                }}
                            />{" "}
                            {errText}
                        </div>
                    )}
                    <label className="label is-small">Username:</label>
                    <div className="control input-wrapper has-icons-left has-icons-right">
                        <input
                            className="input"
                            type="username"
                            placeholder={Client.randomUsername()}
                            value={username}
                            onChange={(event) => {
                                setUsername(event.target.value);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    void loginUser();
                                }
                            }}
                        />
                        <span className="icon is-left">
                            <FontAwesomeIcon icon={faUser} />
                        </span>
                    </div>
                    <label className="label is-small">Password:</label>
                    <div className="control input-wrapper has-icons-left has-icons-right">
                        <input
                            className="input"
                            type="password"
                            placeholder="hunter2"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    void loginUser();
                                }
                            }}
                        />
                        <span className="icon is-left">
                            <FontAwesomeIcon icon={faLock} />
                        </span>
                    </div>
                    <div className="buttons is-right">
                        <button
                            className="button is-plain"
                            onClick={() => {
                                history.push(routes.REGISTER);
                            }}
                        >
                            Register
                        </button>
                        <button
                            className={`button is-success ${
                                loading ? "is-loading" : ""
                            }`}
                            onClick={() => {
                                void loginUser();
                            }}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </VerticalAligner>
    );
});
