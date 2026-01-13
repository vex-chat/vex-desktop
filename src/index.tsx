import jwt from "jsonwebtoken";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { HashRouter as Router } from "react-router-dom";

import { getDbFolder, getKeyFolder, getProgFolder } from "./constants/folders";
import Base from "./Base";
import configuredStore from "./store";
import { DataStoreClass } from "./utils";
import { initAssetPath } from "./utils/getAssetPath";

import "./app.global.scss";

// Initialize folders via IPC
const initFolders = async () => {
    const folders = [
        await getProgFolder(),
        await getDbFolder(),
        await getKeyFolder(),
    ];
    for (const folder of folders) {
        const exists = await window.electron.fs.exists(folder);
        if (!exists) {
            await window.electron.fs.mkdir(folder, { recursive: true });
        }
    }
};

const store = configuredStore();

// Initialize cookies and set up persistence for session cookies
const initCookies = async () => {
    try {
        const cookieList = await window.electron.cookies.get({ path: "/" });
        console.log("Cookie list from session", cookieList);

        // Process any session cookies that need expiration dates
        for (const cookie of cookieList) {
            if (!cookie.path || !cookie.domain) {
                continue;
            }

            const url = `${
                !cookie.httpOnly && cookie.secure ? "https" : "http"
            }://${cookie.domain}${cookie.path}`;

            if (cookie.session) {
                try {
                    const decoded = jwt.decode(cookie.value);
                    if (!decoded) {
                        continue;
                    }
                    const { exp } = decoded as { exp: number };
                    console.log("url", url);
                    await window.electron.cookies.set({
                        url: url,
                        name: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain,
                        path: cookie.path,
                        secure: cookie.secure,
                        httpOnly: cookie.httpOnly,
                        expirationDate: exp,
                    });
                    console.log("Updated cookie with expiration.");
                } catch (err) {
                    console.error("Error updating cookie", err);
                }
            }
        }
    } catch (err) {
        console.error("Error initializing cookies", err);
    }
};

// Initialize app
(async () => {
    await initAssetPath();
    await initFolders();
    await initCookies();
    await DataStoreClass.initWindowDimensions();
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
