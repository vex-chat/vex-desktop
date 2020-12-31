import React from "react";
import { render } from "react-dom";
import { configuredStore } from "./store";
import "./app.global.scss";
import Root from "./Root";

const store = configuredStore();

document.addEventListener("DOMContentLoaded", async () => {
    render(
            <Root store={store} />,
        document.getElementById("root")
    );
});
