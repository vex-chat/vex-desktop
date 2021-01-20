import fs from "fs";
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
