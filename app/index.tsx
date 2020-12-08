/* eslint-disable @typescript-eslint/no-var-requires */
import React, { Fragment } from "react";
import { render } from "react-dom";
import { AppContainer as ReactHotAppContainer } from "react-hot-loader";
import { Client } from "@vex-chat/vex-js";
import { history, configuredStore } from "./store";
import fs from "fs";
import os from "os";
import "app.global.scss";

const homedir = os.homedir();
const progFolder = `${homedir}/.vex-desktop`;

if (!fs.existsSync(progFolder)) {
    fs.mkdirSync(progFolder);
}

const store = configuredStore();
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

if (!localStorage.getItem("PK")) {
    localStorage.setItem("PK", Client.generateSecretKey());
}
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const PK = localStorage.getItem("PK")!;

export const client = new Client(PK, {
    logLevel: "info",
    dbFolder: progFolder,
});
client.init();

document.addEventListener("DOMContentLoaded", () => {
    const Root = require("./containers/Root").default;
    render(
        <AppContainer>
            <Root store={store} history={history} />
        </AppContainer>,
        document.getElementById("root")
    );
});
