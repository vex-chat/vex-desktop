import React, { useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import { routes } from "./constants/routes";
import App from "./views/App";
import HomePage from "./views/HomePage";
import { Client } from "@vex-chat/vex-js";
import { useDispatch } from "react-redux";
import { setUser } from "./reducers/user";
import os from "os";
import { setFamiliars } from "./reducers/familiars";

const homedir = os.homedir();
export const progFolder = `${homedir}/.vex-desktop`;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const client = new Client(localStorage.getItem("PK")!, {
    dbFolder: progFolder,
});
client.on("ready", async () => {
    await client.register("yellnat");
    client.login();
});
client.init();

export default function Base(): JSX.Element {
    const dispatch = useDispatch();

    useEffect(() => {
        client.on("authed", async () => {
            dispatch(setUser(client.users.me()));
            dispatch(setFamiliars(await client.familiars.retrieve()));
        });
    });

    return (
        <App>
            <Switch>
                <Route path={routes.HOME} component={HomePage} />
            </Switch>
        </App>
    );
}
