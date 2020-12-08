import React from "react";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import { hot } from "react-hot-loader/root";
import { History } from "history";
import { Store } from "./store";
import Base from "./Base";

type Props = {
    store: Store;
    history: History;
};

const Root = ({ store, history }: Props) => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Base />
        </ConnectedRouter>
    </Provider>
);

export default hot(Root);
