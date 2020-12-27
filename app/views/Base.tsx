import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { routes } from "../constants/routes";
import App from "../views/App";
import Register from "../views/Register";
import Settings from "../views/Settings";
import { ClientLauncher } from "../components/ClientLauncher";
import CreateServer from "../components/CreateServer";
import Messaging from "./Messaging";
import { Server } from "./Server";
import { KeyGaurdian } from "../utils/KeyGaurdian";
import Store from "electron-store";
import { Logout } from "../components/Logout";
import { LoginForm } from "../components/LoginForm";
import { IdentityPicker } from "../components/IdentityPicker";
import { TitleBar } from "../components/TitleBar";

export const gaurdian = new KeyGaurdian();

export const switchFX = new Audio("assets/sounds/switch_005.ogg");
switchFX.load();

export const errorFX = new Audio("assets/sounds/error_008.ogg");
errorFX.load();

export const dataStore = new Store();

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
                    path={routes.SERVERS + "/:serverID?/:channelID?"}
                    render={({ match }) => <Server match={match} />}
                />
                <Route path={routes.REGISTER} render={() => <Register />} />
                <Route path={routes.SETTINGS} render={() => <Settings />} />
                <Route path={routes.LAUNCH} render={() => <ClientLauncher />} />
                <Route
                    path={routes.CREATE + "/:resourceType?"}
                    render={({ match }) => {
                        switch (match.params.resourceType) {
                            case "server":
                                return <CreateServer />;
                            default:
                                console.warn(
                                    "Unsupported resource type for create route" +
                                        match.params.resourceType
                                );
                                return;
                        }
                    }}
                />
                <Route path={routes.LOGIN} render={() => <LoginForm />} />
                <Route path={routes.LOGOUT} render={() => <Logout />} />
                <Route
                    exact
                    path={routes.HOME}
                    render={() => {
                        if (gaurdian.hasKey()) {
                            return <Redirect to={routes.LAUNCH} />;
                        } else {
                            return <IdentityPicker />;
                        }
                    }}
                />
            </Switch>
        </App>
    );
}
