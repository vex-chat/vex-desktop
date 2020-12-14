/* eslint-disable @typescript-eslint/no-var-requires */
import React, { Fragment } from "react";
import { render } from "react-dom";
import { AppContainer as ReactHotAppContainer } from "react-hot-loader";
import { Client } from "@vex-chat/vex-js";
import { history, configuredStore } from "./store";
import fs from "fs";
import os from "os";
import "app.global.scss";
import Root from "./Root";
import { performance } from "perf_hooks";
import { Highlighter } from "./components/Highlighter";
import packageInfo from "./package.json";

const homedir = os.homedir();
export const progFolder = `${homedir}/.vex-desktop`;

if (!fs.existsSync(progFolder)) {
    fs.mkdirSync(progFolder);
}

const average = (array: number[]) =>
    array.reduce((a, b) => a + b) / array.length;

const highlightTimes: number[] = [];
const highlightAutoTimes: number[] = [];

const trials = 1000;

for (let i = 0; i < trials; i++) {
    const t0 = performance.now();
    Highlighter(JSON.stringify(packageInfo, null, 4));
    const t1 = performance.now();
    highlightAutoTimes.push(t1 - t0);
}

for (let i = 0; i < trials; i++) {
    const t0 = performance.now();
    Highlighter(JSON.stringify(packageInfo, null, 4), "json");
    const t1 = performance.now();
    highlightTimes.push(t1 - t0);
}

console.log("trials: " + trials);
console.log("highlightAuto: " + average(highlightAutoTimes));
console.log("highlight: " + average(highlightTimes));

const store = configuredStore();
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

if (!localStorage.getItem("PK")) {
    localStorage.setItem("PK", Client.generateSecretKey());
}

document.addEventListener("DOMContentLoaded", async () => {
    render(
        <AppContainer>
            <Root store={store} history={history} />
        </AppContainer>,
        document.getElementById("root")
    );
});
