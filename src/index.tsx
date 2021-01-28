import { remote } from "electron";
import fs from "fs";
import jwt from "jsonwebtoken";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { HashRouter as Router } from "react-router-dom";

import { dbFolder, keyFolder, progFolder } from "./constants/folders";
import Base from "./Base";
import configuredStore from "./store";

import "./app.global.scss";

// this maybe needs a better place to go
const folders = [progFolder, dbFolder, keyFolder];
for (const folder of folders) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
}

const store = configuredStore();

// set our cookies
(async () => {
    const cookies = remote.getCurrentWebContents().session.cookies;
    const cookieList = await cookies.get({
        name: "auth",
    });
    console.log("Cookie list from session", cookieList);

    cookies.on(
        "changed",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (
            _event: unknown,
            cookie: Electron.Cookie,
            _cause: unknown,
            removed: boolean
        ) => {
            if (!cookie.path || !cookie.domain) {
                return;
            }

            const url = `${
                !cookie.httpOnly && cookie.secure ? "https" : "http"
            }://${cookie.domain}${cookie.path}`;

            if (cookie.session && !removed) {
                try {
                    const decoded = jwt.decode(cookie.value);
                    if (!decoded) {
                        throw new Error("Couldn't decode JWT.");
                    }
                    const { exp } = decoded as { exp: number };

                    console.log("url", url);
                    await cookies.set({
                        url: url,
                        name: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain,
                        path: cookie.path,
                        secure: cookie.secure,
                        httpOnly: cookie.httpOnly,
                        expirationDate: exp,
                    });
                    console.log("Updated cookies.");
                } catch (err) {
                    console.error("Error updating cookies", err);
                }
            }
        }
    );
})();

document.addEventListener("DOMContentLoaded", () => {
    render(
        <Provider store={store}>
            <Router>
                <Base />
            </Router>
        </Provider>,
        document.getElementById("root")
    );
});
