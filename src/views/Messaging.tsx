import React, { Fragment } from "react";
import MessagingBar from "../components/MessagingBar";
import MessagingPane from "../components/MessagingPane";
import { useSelector } from "react-redux";
import { selectApp } from "../reducers/app";
import Loading from "../components/Loading";
import { ServerBar } from "../components/ServerBar";
import { UserMenu } from "../components/UserMenu";

export default function Messaging(): JSX.Element {
    const app = useSelector(selectApp);

    if (app.initialLoad) {
        return <Loading size={256} animation={"cylon"} />;
    }

    return (
        <Fragment>
            <ServerBar />
            <MessagingBar />
            <MessagingPane />
            <UserMenu />
        </Fragment>
    );
}
