import type { FunctionComponent } from "react";

import { Client } from "@vex-chat/libvex";

import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import fs from "fs";
import { memo, useState } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";

import { BackButton } from "../components/BackButton";
import { VerticalAligner } from "../components/VerticalAligner";
import { dbFolder, keyFolder } from "../constants/folders";
import { routes } from "../constants/routes";
import gaurdian from "../utils/KeyGaurdian";

export const Login: FunctionComponent = memo(() => {
    const history = useHistory();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errText, setErrText] = useState("");

    const loginUser = async () => {
        if (password == "") {
            return;
        }
        gaurdian.setAuthInfo(username, password);

        const tempClient = new Client(undefined, { inMemoryDb: true });
        const [userDetails] = await tempClient.users.retrieve(username);
        if (!userDetails) {
            console.error("User not found.");
            setLoading(false);
            history.push(routes.HOME);
            setErrText("User not found.");
            return;
        }

        setLoading(true);
        const keyPath = `${keyFolder}/${username}`;
        if (fs.existsSync(keyPath)) {
            try {
                gaurdian.load(keyPath, "");
                history.push(routes.HOME);
            } catch (err) {
                console.error(err);
                setErrText(err.toString());
                setLoading(false);
                history.push(routes.HOME);
                return;
            }
        } else {
            console.log("No keyfile found, attempting to register.");
            const NSK = Client.generateSecretKey();
            const tempClient = new Client(NSK, { dbFolder });

            tempClient.on("ready", async () => {
                console.log("Ready event reached, registering now.");
                try {
                    await tempClient.devices.register(username, password);
                    void tempClient.close();

                    setUsername("");
                    setPassword("");

                    Client.saveKeyFile(keyPath, "", NSK);
                    gaurdian.load(keyPath);
                    history.push(routes.HOME);
                } catch (err) {
                    console.error(err);
                    setErrText(err.toString());
                    setLoading(false);
                    void tempClient.close();
                    history.push(routes.HOME);
                    return;
                }
            });

            void tempClient.init();
        }
    };

    return (
        <VerticalAligner top={<BackButton route={routes.HOME} />}>
            <div className="box">
                <div className="tabs">
                    <ul>
                        <li className="is-active">
                            <a>Login</a>
                        </li>
                        <li>
                            <Link to={routes.REGISTER}>Register</Link>
                        </li>
                    </ul>
                </div>
                {errText !== "" && (
                    <div className="notification is-danger">{errText}</div>
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
                        <FontAwesomeIcon icon={faLock} />
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
        </VerticalAligner>
    );
});
