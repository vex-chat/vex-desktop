import { render } from "react-dom";
import { Provider } from "react-redux";
import { HashRouter as Router } from "react-router-dom";

import Base from "./views/Base";
import configuredStore from "./store";

import "./app.global.scss";

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
