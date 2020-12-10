import React, { Fragment } from "react";
import Sidebar from "../components/Sidebar";
import Pane from "../components/Pane";

export default function Home(): JSX.Element {
    return (
        <Fragment>
            <Sidebar />
            <Pane />
        </Fragment>
    );
}
