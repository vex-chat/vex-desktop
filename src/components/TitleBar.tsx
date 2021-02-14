import type { IUser } from "@vex-chat/libvex";

import { remote } from "electron";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory } from "react-router-dom";

import closeIconBlack from "../../assets/windowIcons/close-black.svg";
import closeIconWhite from "../../assets/windowIcons/close-white.svg";
import maximizeIconBlack from "../../assets/windowIcons/maximize-black.svg";
import maximizeIconWhite from "../../assets/windowIcons/maximize-white.svg";
import minimizeIconBlack from "../../assets/windowIcons/minimize-black.svg";
import minimizeIconWhite from "../../assets/windowIcons/minimize-white.svg";
import { routes } from "../constants";
import { colors } from "../constants/colors";
import { selectApp } from "../reducers/app";
import { addFamiliar } from "../reducers/familiars";
import { stubSession } from "../reducers/sessions";

import { ServerTitlebar } from "./ChannelBar";
import { TopbarButtons } from "./TopbarButtons";
import { UserSearchBar } from "./UserSearchBar";

export function TitleBar(props: {
    updateAvailable: boolean;
    userBarOpen: boolean;
    setUserBarOpen: (status: boolean) => void;
    showButtons: boolean;
}): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();
    const app = useSelector(selectApp);

    function closeWindow() {
        const window = remote.getCurrentWindow();
        window.hide();
    }

    function maximizeWindow() {
        const window = remote.getCurrentWindow();

        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    }

    function minimizeWindow() {
        remote.getCurrentWindow().minimize();
    }

    const newConversation = (user: IUser) => {
        dispatch(addFamiliar(user));
        dispatch(stubSession(user.userID));

        history.push(routes.MESSAGING + "/" + user.userID);
    };

    const darkMode =
        app.themeColors.theme_color_0 === colors.black.theme_color_0;

    return (
        <header id="titlebar" onDoubleClick={maximizeWindow}>
            <div id="drag-region">
                {!app.initialLoad && (
                    <Switch>
                        <Route
                            path={
                                routes.SERVERS +
                                "/:serverID?/:pageType/:channelID?/:channelPage?"
                            }
                            render={({ match }) => (
                                <ServerTitlebar
                                    serverID={match.params.serverID}
                                    name={"test"}
                                />
                            )}
                        />
                        <Route
                            path={routes.MESSAGING}
                            render={() => (
                                <div className="field search-wrapper">
                                    <div className="field">
                                        <UserSearchBar
                                            onSelectUser={(user: IUser) => {
                                                newConversation(user);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        />
                    </Switch>
                )}

                {props.showButtons && (
                    <TopbarButtons
                        setUserBarOpen={props.setUserBarOpen}
                        userBarOpen={props.userBarOpen}
                        updateAvailable={props.updateAvailable}
                    />
                )}

                {process.platform !== "darwin" && (
                    <div className="no-drag" id="window-controls">
                        <div
                            className="window-button pointer"
                            id="min-button"
                            onClick={minimizeWindow}
                        >
                            <img
                                src={
                                    darkMode
                                        ? minimizeIconWhite
                                        : minimizeIconBlack
                                }
                            />
                        </div>

                        <div
                            className="window-button pointer"
                            id="max-button"
                            onClick={maximizeWindow}
                        >
                            <img
                                src={
                                    darkMode
                                        ? maximizeIconWhite
                                        : maximizeIconBlack
                                }
                            />
                        </div>

                        <div
                            className="window-button pointer"
                            id="close-button"
                            onClick={closeWindow}
                        >
                            <img
                                onMouseOut={(e) => {
                                    e.currentTarget.src = darkMode
                                        ? closeIconWhite
                                        : closeIconBlack;
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.src = closeIconWhite;
                                }}
                                src={darkMode ? closeIconWhite : closeIconBlack}
                            />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
