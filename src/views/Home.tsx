import { Redirect } from "react-router";

import { routes } from "../constants";
import { gaurdian } from "../utils";

import { Login } from "./Login";

export function Home(): JSX.Element {
    if (gaurdian.hasKey()) {
        return <Redirect to={routes.LAUNCH} />;
    } else {
        return <Login />;
    }
}
