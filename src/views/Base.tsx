import React from "react";
import { Switch, Route } from "react-router-dom";
import { routes } from "../constants/routes";
import App from "./App";
import Register from "./Register";
import Settings from "./Settings";
import { ClientLauncher } from "./ClientLauncher";
import Messaging from "./Messaging";
import { Server } from "./Server";
import { Logout } from "./Logout";
import { Login } from "./Login";
import { TitleBar } from "../components/TitleBar";
import { Create } from "./Create";
import { Home } from "./Home";

export default function Base(): JSX.Element {
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
                <Route path={routes.SETTINGS} render={() => <Settings />} />
                <Route path={routes.LAUNCH} render={() => <ClientLauncher />} />
                <Route
                    path={routes.CREATE + "/:resourceType?"}
                    render={() => <Create />}
                />
                <Route path={routes.LOGIN} render={() => <Login />} />
                <Route path={routes.LOGOUT} render={() => <Logout />} />
                <Route exact path={routes.HOME} render={() => <Home />} />
            </Switch>
        </App>
    );
}
