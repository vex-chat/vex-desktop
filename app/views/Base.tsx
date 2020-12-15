import React from "react";
import { Switch, Route, Redirect, Link, useHistory } from "react-router-dom";
import { routes } from "../constants/routes";
import App from "../views/App";
import Register from "../views/Register";
import Loading from "../components/Loading";
import Settings from "../views/Settings";

import closeIcon from "../assets/icons/close.svg";
import minimizeIcon from "../assets/icons/minimize.svg";
import maximizeIcon from "../assets/icons/maximize.svg";
import { ServerBar } from "../components/ServerBar";
import { ChannelBar } from "../components/ChannelBar";
import { strToIcon } from "../utils/strToIcon";
import { XTypes } from "@vex-chat/types-js";
import * as uuid from "uuid";
import { ClientLauncher } from "../components/ClientLauncher";
import Messaging from "./Messaging";

export const switchFX = new Audio("assets/sounds/switch_005.ogg");
switchFX.load();

export const errorFX = new Audio("assets/sounds/error_008.ogg");
errorFX.load();

const dummyServer: _IServer = {
    serverID: uuid.v4(),
    name: "Dummies",
    icon: strToIcon("DU"),
};

const dummyChannel: XTypes.SQL.IChannel = {
    serverID: dummyServer.serverID,
    name: "general",
    channelID: uuid.v4(),
};

const dummyChannel2: XTypes.SQL.IChannel = {
    serverID: dummyServer.serverID,
    name: "chat",
    channelID: uuid.v4(),
};
export const dummyChannels = [dummyChannel, dummyChannel2];

export const dummyServers: _IServer[] = [dummyServer];

export interface _IServer extends XTypes.SQL.IServer {
    icon: string;
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

    const TitleBar = () => (
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
                    render={() => {
                        return (
                            <div>
                                <ServerBar servers={dummyServers} />
                                <ChannelBar
                                    server={dummyServer}
                                    channels={dummyChannels}
                                />
                            </div>
                        );
                    }}
                />
                <Route path={routes.REGISTER} component={Register} />
                <Route path={routes.SETTINGS} component={Settings} />
                <Route
                    path={routes.LAUNCH}
                    render={() => (
                        <div>
                            <ClientLauncher />
                            <Loading size={256} animation={"cylon"} />
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
