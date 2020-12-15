import React, { Fragment } from "react";
import Sidebar from "../components/Sidebar";
import Pane from "../components/Pane";
import { useSelector } from "react-redux";
import { selectApp } from "../reducers/app";
import Loading from "../components/Loading";
import { dummyServers } from "./Base";
import { ServerBar } from "../components/ServerBar";

export default function Messaging(): JSX.Element {
    const app = useSelector(selectApp);

    if (app.initialLoad) {
        return <Loading size={256} animation={"cylon"} />;
    }

    return (
        <Fragment>
            <ServerBar servers={dummyServers} />
            <Sidebar />
            <Pane />
        </Fragment>
    );
}
