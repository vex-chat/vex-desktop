import type { FunctionComponent } from "react";

import { Client } from "@vex-chat/libvex";

import { Lock as LockIcon, User as UserIcon } from "react-feather";
import fs from "fs";
import { Fragment, memo, useMemo, useState } from "react";
import { useHistory } from "react-router";

import { Loading, TitleBar, VerticalAligner } from "../components";
import { errorFX, keyFolder, routes, unlockFX } from "../constants";
import { useQuery } from "../hooks";
import { createClient, DataStore, gaurdian } from "../utils";

export const Login: FunctionComponent = memo(() => {
    const history = useHistory();
    const query = useQuery();

    const loggedOut = query.get("logout") === "true";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [checkedCookie, setCheckedCookie] = useState(loggedOut);

    const [loading, setLoading] = useState(false);
    const [errText, setErrText] = useState("");

    const [checkCookieErrText, setCheckCookieErrText] = useState("");

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
        const client = await createClient(false, gaurdian.getKey());

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

    const checkCookieAndLogin = async () => {
        if (loggedOut) {
            setCheckedCookie(true);
            return;
        }

        if (!checkedCookie) {
            console.log("Checking for cookie.");
            const tempClient = await createClient(true);
            try {
                const { user } = await tempClient.whoami();

                setCheckCookieErrText("");
                setLoading(true);

                const keyPath = keyFolder + "/" + user.username.toLowerCase();
                if (fs.existsSync(keyPath)) {
                    gaurdian.load(keyPath);
                } else {
                    throw new Error("Found cookie, but no keyfile.");
                }

                const client = await createClient(false, gaurdian.getKey());

                window.vex = client;
                history.push(routes.LAUNCH);
            } catch (err) {
                console.warn(err);
                if (err.response) {
                    console.warn(err.response?.status);
                    if (err.response.status === 502) {
                        setCheckCookieErrText(
                            "Having some trouble connecting to the server..."
                        );
                        console.log(checkCookieErrText);
                        setTimeout(checkCookieAndLogin, 5000);
                        return;
                    }
                }
            }
            setCheckedCookie(true);
        }
    };

    useMemo(() => {
        checkCookieAndLogin();
    }, [history.location.pathname]);

    if (!checkedCookie) {
        return (
            <Loading
                animation="cylon"
                size={256}
                errText={checkCookieErrText}
            />
        );
    }

    return (
        <Fragment>
            <TitleBar
                updateAvailable={false}
                userBarOpen={false}
                setUserBarOpen={() => {
                    /* lol */
                }}
                showButtons={false}
            />
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
                                <UserIcon />
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
                                <LockIcon />
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
        </Fragment>
    );
});
