import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { routes } from "../constants/routes";
import App from "../views/App";
import Messaging from "../views/Messaging";
import { IMessage } from "@vex-chat/vex-js";
import Register from "../views/Register";
import Loading from "../components/Loading";
import Settings from "../views/Settings";
import { ClientLauncher } from "../components/ClientLauncher";

import closeIcon from "../assets/icons/close.svg";
import minimizeIcon from "../assets/icons/minimize.svg";
import maximizeIcon from "../assets/icons/maximize.svg";

export const switchFX = new Audio("assets/sounds/switch_005.ogg");
switchFX.load();

export const errorFX = new Audio("assets/sounds/error_008.ogg");
errorFX.load();

export interface IDisplayMessage extends IMessage {
    timestamp: Date;
    direction: "outgoing" | "incoming";
}

export default function Base(): JSX.Element {
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
        <App>
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
            <Switch>
                <Route
                    path={routes.MESSAGING + "/:userID/:page?/:sessionID?"}
                    component={Messaging}
                />
                <Route path={routes.REGISTER} component={Register} />
                <Route path={routes.SETTINGS} component={Settings} />
                <Route
                    path={routes.LAUNCH}
                    component={() => (
                        <div>
                            {ClientLauncher()}
                            {Loading(256)}
                        </div>
                    )}
                />
                <Route
                    exact
                    path={routes.HOME}
                    render={() => {
                        return <Redirect to={routes.LAUNCH} />;
                    }}
                />
            </Switch>
        </App>
    );
}
