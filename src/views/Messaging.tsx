import { Fragment } from "react";
import { useSelector } from "react-redux";

import Loading from "../components/Loading";
import MessagingBar from "../components/MessagingBar";
import MessagingPane from "../components/MessagingPane";
import { ServerBar } from "../components/ServerBar";
import { UserMenu } from "../components/UserMenu";
import { selectApp } from "../reducers/app";

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
