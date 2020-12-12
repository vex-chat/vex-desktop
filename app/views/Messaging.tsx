import React, { Fragment } from "react";
import Sidebar from "../components/Sidebar";
import Pane from "../components/Pane";
import { useSelector } from "react-redux";
import { selectApp } from "../reducers/app";
import Loading from "../components/Loading";

export default function Home(): JSX.Element {
    const app = useSelector(selectApp);

    if (app.initialLoad) {
        return Loading(256);
    }

    return (
        <Fragment>
            <Sidebar />
            <Pane />
        </Fragment>
    );
}
