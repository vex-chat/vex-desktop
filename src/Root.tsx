import React from "react";
import { Provider } from "react-redux";
import {
    HashRouter as Router,
  } from "react-router-dom";
import { Store } from "./store";
import Base from "./views/Base";

type Props = {
    store: Store;
};

const Root = ({ store }: Props) => (
    <Provider store={store}>
        <Router>
            <Base />
        </Router>   
    </Provider>
);

export default Root;
