import React from "react";
import { Redirect } from "react-router";

import { IdentityPicker } from "../components/IdentityPicker";
import { routes } from "../constants/routes";
import gaurdian from "../utils/KeyGaurdian";

export function Home(): JSX.Element {
    if (gaurdian.hasKey()) {
        return <Redirect to={routes.LAUNCH} />;
    } else {
        return <IdentityPicker />;
    }
}
