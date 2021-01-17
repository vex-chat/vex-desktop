import { ipcRenderer } from "electron";
import { useEffect } from "react";
import { Route, Switch, useHistory } from "react-router-dom";

import Loading from "../components/Loading";
import { TitleBar } from "../components/TitleBar";
import { routes } from "../constants/routes";

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

    const onUpdateStatus = (data: any) => {
        console.log(data);
        const { status } = data as updateStatus;
        switch (status) {
            case "available":
                history.push(routes.UPDATING);
                break;
            default:
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
                <Route
                    path={routes.UPDATING}
                    render={() => <Loading size={256} animation={"cylon"} />}
                />
            </Switch>
        </App>
    );
}
