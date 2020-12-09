import React, { Fragment } from "react";
import Sidebar from "./Sidebar";
import Pane from "./Pane";

export default function Home(): JSX.Element {
    return (
        <Fragment>
            <Sidebar />
            <Pane />
        </Fragment>
    );
}
