import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { routes } from "../constants/routes";
import App from "../views/App";
import Register from "../views/Register";
import Settings from "../views/Settings";

import closeIcon from "../assets/icons/close.svg";
import minimizeIcon from "../assets/icons/minimize.svg";
import maximizeIcon from "../assets/icons/maximize.svg";
import { ClientLauncher } from "../components/ClientLauncher";
import CreateServer from "../components/CreateServer";
import Messaging from "./Messaging";
import { Server } from "./Server";

export const switchFX = new Audio("assets/sounds/switch_005.ogg");
switchFX.load();

export const errorFX = new Audio("assets/sounds/error_008.ogg");
errorFX.load();

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
                <Route
                    exact
                    path={routes.HOME}
                    render={() => <Redirect to={routes.LAUNCH} />}
                />
            </Switch>
        </App>
    );
}

export function TitleBar(): JSX.Element {
    function closeWindow() {
        const remote = window.require
            ? window.require("electron").remote
            : null;
        const WIN = remote?.getCurrentWindow();
        WIN?.close();
    }

    function minimizeWindow() {
        const remote = window.require
            ? window.require("electron").remote
            : null;
        const WIN = remote?.getCurrentWindow();
        WIN?.minimize();
    }

    function maximizeWindow() {
        const remote = window.require
            ? window.require("electron").remote
            : null;
        const WIN = remote?.getCurrentWindow();
        WIN?.maximize();
    }

    return (
        <div className="title-bar">
            {process.platform !== "darwin" && (
                <div className="window-buttons">
                    <span
                        onClick={() => minimizeWindow()}
                        className="icon is-small minimize-button "
                    >
                        <img
                            src={(minimizeIcon as unknown) as string}
                            className="window-button-icon"
                        />
                    </span>
                    <span
                        onClick={() => maximizeWindow()}
                        className="icon maximize-button is-small has-text-danger pointer"
                    >
                        <img
                            src={(maximizeIcon as unknown) as string}
                            className="window-button-icon"
                        />
                    </span>
                    <span
                        onClick={() => closeWindow()}
                        className="icon close-button is-small has-text-danger pointer"
                    >
                        <img
                            src={(closeIcon as unknown) as string}
                            className="window-button-icon"
                        />
                    </span>
                </div>
            )}
        </div>
    );
}
