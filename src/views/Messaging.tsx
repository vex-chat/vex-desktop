import { Fragment } from "react";
import { useSelector } from "react-redux";

import {
    Loading,
    MessagingBar,
    MessagingPane,
    ServerBar,
    TopbarButtons,
    UserMenu,
} from "../components";
import { selectApp } from "../reducers/app";

export default function Messaging(props: {
    updateAvailable: boolean;
}): JSX.Element {
    const app = useSelector(selectApp);

    if (app.initialLoad) {
        return <Loading size={256} animation={"cylon"} />;
    }

    return (
        <Fragment>
            <TopbarButtons
                updateAvailable={props.updateAvailable}
                userBarOpen={false}
                setUserBarOpen={null}
            />
            <ServerBar />
            <MessagingBar />
            <MessagingPane />
            <UserMenu />
        </Fragment>
    );
}
