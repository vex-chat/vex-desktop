import axios from "axios";
import { shell } from "electron";
import { useEffect, useMemo, useState } from "react";
import { Route, Switch } from "react-router-dom";
import semver from "semver";

import { TitleBar } from "../components/TitleBar";
import { routes } from "../constants/routes";
import { version } from "../package.json";

import App from "./App";
import { ClientLauncher } from "./ClientLauncher";
import { Create } from "./Create";
import { Home } from "./Home";
import { Login } from "./Login";
import { Logout } from "./Logout";
import Messaging from "./Messaging";
import Register from "./Register";
import { Server } from "./Server";

export default function Base(): JSX.Element {
    const [modalOpen, setModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [release, setRelease] = useState({} as Record<string, any>);
    const [lastFetch, setLastFetch] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setLastFetch(Date.now());
        }, 1000 * 60 * 60);
        return () => {
            clearInterval(interval);
        };
    });

    useMemo(async () => {
        try {
            const res = await axios.get(
                "https://api.github.com/repos/vex-chat/vex-desktop/releases"
            );
            const latest = res.data[0];

            setRelease(latest);

            console.log(latest);
            const { tag_name } = latest;

            if (semver.lt(version, tag_name)) {
                console.log("Newer version available.");
                setModalOpen(true);
            }
        } catch (err) {
            console.warn(err.toString());
        }
    }, [lastFetch]);
    return (
        <App>
            <TitleBar />
            <Switch>
                <Route
                    path={routes.MESSAGING + "/:userID?/:page?/:sessionID?"}
                    render={() => <Messaging />}
                />
                <Route
                    path={
                        routes.SERVERS +
                        "/:serverID?/:pageType/:channelID?/:channelPage?"
                    }
                    render={() => <Server />}
                />
                <Route path={routes.REGISTER} render={() => <Register />} />
                <Route path={routes.LAUNCH} render={() => <ClientLauncher />} />
                <Route
                    path={routes.CREATE + "/:resourceType?"}
                    render={() => <Create />}
                />
                <Route path={routes.LOGIN} render={() => <Login />} />
                <Route path={routes.LOGOUT} render={() => <Logout />} />
                <Route exact path={routes.HOME} render={() => <Home />} />
            </Switch>

            <div className={`modal ${modalOpen ? "is-active" : ""}`}>
                <div
                    className="modal-background"
                    onClick={() => {
                        setModalOpen(true);
                    }}
                ></div>
                <div className="modal-content">
                    <div className="box">
                        <h1 className="title">Newer Version Available</h1>
                        <p>
                            There&apos;s a new version of vex available. Would
                            you like to go to the release page?
                        </p>
                        <br />
                        <br />
                        <div className="buttons is-right">
                            <div
                                className="button is-plain"
                                onClick={() => {
                                    setModalOpen(false);
                                }}
                            >
                                Not now
                            </div>
                            <div
                                className="button is-success"
                                onClick={() => {
                                    setModalOpen(false);
                                    shell.openExternal(release.html_url);
                                    console.log("Downloadarino!");
                                }}
                            >
                                Download
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    className="modal-close is-large"
                    aria-label="close"
                    onClick={() => {
                        setModalOpen(false);
                    }}
                ></button>
            </div>
        </App>
    );
}
