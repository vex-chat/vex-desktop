import axios from "axios";
import { ipcRenderer } from "electron";
import log from "electron-log";
import { useEffect, useMemo, useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import semver from "semver";

import Loading from "../components/Loading";
import { TitleBar } from "../components/TitleBar";
import { routes } from "../constants/routes";
import { version as currentVersion } from "../package.json";

import App from "./App";
import { ClientLauncher } from "./ClientLauncher";
import { Create } from "./Create";
import { Home } from "./Home";
import { Login } from "./Login";
import { Logout } from "./Logout";
import Messaging from "./Messaging";
import Register from "./Register";
import { Server } from "./Server";

type UpdateDownloadProgress = {
    bytesPerSecond: number;
    percent: number;
    transferred: number;
    total: number;
};

type updateStatus = {
    status:
        | "checking"
        | "available"
        | "current"
        | "error"
        | "progress"
        | "downloaded";
    message?: string;
    data?: UpdateDownloadProgress;
};

export default function Base(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = useHistory();
    const [lastFetched, setLastFetched] = useState(Date.now);
    const [updateAvailable, setUpdateAvailable] = useState(false);

    useMemo(async () => {
        const res = await axios.get(
            "https://api.github.com/repos/vex-chat/vex-desktop/releases/latest"
        );
        if (semver.gt(res.data.tag_name, currentVersion)) {
            setUpdateAvailable(true);
        }
    }, [lastFetched]);

    const onUpdateStatus = (_event: Event, data: updateStatus) => {
        log.info("ON UPDATE STATUS REACHED");
        log.info("data", data);
        const { status } = data;
        switch (status) {
            case "checking":
                log.info("Checking for updates.");
                break;
            case "current":
                log.info("We are on current version.");
                break;
            case "error":
                log.info("Error fetching update data.");
                log.error(data);
                log.info("We are on current version.");
                break;
            case "available":
                log.info("Update available.");
                history.push(routes.UPDATING);
                break;
            case "downloaded":
                log.info("Update has been downloaded.");
                break;
            case "progress":
                if (!history.location.pathname.includes(routes.UPDATING)) {
                    history.push(routes.UPDATING);
                }
                log.info("progress", data);
                break;
            default:
                log.info(`updater: Don't know how to ${status as string}`);
                break;
        }
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ipcRenderer.on("autoUpdater", onUpdateStatus);

        return () => {
            ipcRenderer.off("autoUpdater", onUpdateStatus);
        };
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setLastFetched(Date.now());
        }, 1000 * 60 * 60);
        return () => {
            clearInterval(interval);
        };
    });

    return (
        <App>
            <TitleBar />
            <Switch>
                <Route
                    path={routes.MESSAGING + "/:userID?/:page?/:sessionID?"}
                    render={() => (
                        <Messaging updateAvailable={updateAvailable} />
                    )}
                />
                <Route
                    path={
                        routes.SERVERS +
                        "/:serverID?/:pageType/:channelID?/:channelPage?"
                    }
                    render={() => <Server updateAvailable={updateAvailable} />}
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
                <Route
                    path={routes.UPDATING}
                    render={() => <Loading size={256} animation={"cylon"} />}
                />
            </Switch>
        </App>
    );
}
