import { Route, Switch } from "react-router-dom";

import { TitleBar } from "../components/TitleBar";
import { routes } from "../constants/routes";

import App from "./App";
import { ClientLauncher } from "./ClientLauncher";
import { Create } from "./Create";
import { Home } from "./Home";
import { Login } from "./Login";
import { Logout } from "./Logout";
import Messaging from "./Messaging";
import Register from "./Register";
import { Server } from "./Server";

export default function Base(): JSX.Element {
    return (
        <App>
            <TitleBar />
            <Switch>
                <Route
                    path={routes.MESSAGING + "/:userID?/:page?/:sessionID?"}
                    render={() => <Messaging />}
                />
                <Route
                    path={
                        routes.SERVERS +
                        "/:serverID?/:pageType/:channelID?/:channelPage?"
                    }
                    render={() => <Server />}
                />
                <Route path={routes.REGISTER} render={() => <Register />} />
                <Route path={routes.LAUNCH} render={() => <ClientLauncher />} />
                <Route
                    path={routes.CREATE + "/:resourceType?"}
                    render={() => <Create />}
                />
                <Route path={routes.LOGIN} render={() => <Login />} />
                <Route path={routes.LOGOUT} render={() => <Logout />} />
                <Route exact path={routes.HOME} render={() => <Home />} />
            </Switch>
        </App>
    );
}
