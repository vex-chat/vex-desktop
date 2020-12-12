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

export const switchFX = new Audio("assets/sounds/switch_005.ogg");
switchFX.load();

export const errorFX = new Audio("assets/sounds/error_008.ogg");
errorFX.load();

export interface IDisplayMessage extends IMessage {
    timestamp: Date;
    direction: "outgoing" | "incoming";
}

export default function Base(): JSX.Element {
    return (
        <App>
            <div className="title-bar" />
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
