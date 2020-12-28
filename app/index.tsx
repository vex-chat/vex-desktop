/* eslint-disable @typescript-eslint/no-var-requires */
import './wdyr';

import React, { Fragment } from "react";
import { render } from "react-dom";
import { AppContainer as ReactHotAppContainer } from "react-hot-loader";
import { history, configuredStore } from "./store";
import "app.global.scss";
import Root from "./Root";

const store = configuredStore();
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener("DOMContentLoaded", async () => {
    render(
        <AppContainer>
            <Root store={store} history={history} />
        </AppContainer>,
        document.getElementById("root")
    );
});
