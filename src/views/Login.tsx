import type { FunctionComponent } from "react";

import { Client } from "@vex-chat/libvex";

import { Lock as LockIcon, User as UserIcon } from "react-feather";
import { Fragment, memo, useState, useEffect, useRef } from "react";
import { useHistory } from "react-router";

import { Loading, TitleBar, VerticalAligner } from "../components";
import { errorFX, getKeyFolder, routes, unlockFX } from "../constants";
import { useQuery } from "../hooks";
import { createClient, DataStore, gaurdian } from "../utils";

export const Login: FunctionComponent = memo(() => {
    const history = useHistory();
    const query = useQuery();

    const loggedOut = query.get("logout") === "true";
    const hasRun = useRef(false);
    const isMounted = useRef(true);

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

        const keyPath = (await getKeyFolder()) + "/" + username.toLowerCase();

        if (await window.electron.fs.exists(keyPath)) {
            await gaurdian.load(keyPath);
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

        if (!(await window.electron.fs.exists(keyPath))) {
            Client.saveKeyFile(keyPath, "", gaurdian.getKey());
        }

        window.vex = client;
        history.push(routes.LAUNCH);
    };

    const checkCookieAndLogin = async () => {
        if (hasRun.current || checkedCookie || loggedOut) {
            return;
        }
        hasRun.current = true;


        try {
            const keyFolder = await getKeyFolder();
            const allFiles = await window.electron.fs.readdir(keyFolder);

            const keyFiles = allFiles.filter(
                f => !f.endsWith('.token') &&
                    !f.endsWith('.sqlite') &&
                    !f.endsWith('.device.token')
            );

            for (const keyFile of keyFiles) {
                if (!isMounted.current) return;

                const keyPath = keyFolder + "/" + keyFile;

                try {
                    await gaurdian.load(keyPath);
                    const client = await createClient(false, gaurdian.getKey());


                    try {
                        const { user, token } = await client.whoami();

                        if (!token) {
                            await client.close();
                            continue;
                        }

                        if (!isMounted.current) {
                            await client.close();
                            return;
                        }


                        window.vex = client;
                        setCheckedCookie(true);
                        history.push(routes.LAUNCH);
                        return;

                    } catch (whoamiErr) {
                        client.clearToken();
                        await client.close();
                        continue;
                    }

                } catch (err) {
                    console.log("Error loading key:", err);
                    continue;
                }
            }

            console.log("No valid sessions found");

        } catch (err) {
            console.log("Error checking for saved sessions:", err);
            if (isMounted.current) {
                setCheckCookieErrText(String(err));
            }
        }

        if (isMounted.current) {
            setCheckedCookie(true);
        }
    };

    useEffect(() => {
        isMounted.current = true;

        if (!checkedCookie && !loggedOut && !hasRun.current) {
            checkCookieAndLogin();
        }

        return () => {
            isMounted.current = false;
        };
    }, [checkedCookie, loggedOut]);

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
                setUserBarOpen={() => {}}
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
