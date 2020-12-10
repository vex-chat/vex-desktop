import React, { Fragment } from "react";
import Sidebar from "./Sidebar";
import Pane from "./Pane";

export default function Home(): JSX.Element {
    return (
        <Fragment>
            <div className="title-bar"></div>
            <Sidebar />
            <Pane />
        </Fragment>
    );
}
