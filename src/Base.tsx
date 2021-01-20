import axios from "axios";
import { ipcRenderer, shell } from "electron";
import log from "electron-log";
import { useEffect, useMemo, useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import semver from "semver";
import * as uuid from "uuid";

import { Loading, TitleBar } from "./components";
import { routes } from "./constants";
import { version as currentVersion } from "./package.json";
import { DataStore } from "./utils";
import {
    App,
    ClientLauncher,
    Create,
    Home,
    Login,
    Logout,
    Messaging,
    Register,
    Server,
} from "./views";

type UpdateDownloadProgress = {
    bytesPerSecond: number;
    percent: number;
    transferred: number;
    total: number;
};

type updateStatus = {
    status:
        | "checking"
        | "available"
        | "current"
        | "error"
        | "progress"
        | "downloaded";
    message?: string;
    data?: UpdateDownloadProgress;
};

export default function Base(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = useHistory();
    const [lastFetched, setLastFetched] = useState(Date.now);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [modalContents, setModalContents] = useState(
        null as JSX.Element | null
    );

    const openInvite = (url: string) => {
        const inviteID = url.split("/").pop();

        const unauthedRoutes = ["/", "/register", "/login"];
        if (unauthedRoutes.includes(history.location.pathname)) {
            console.warn("Clicked invite link, but not logged in.");
            setModalContents(
                <p>You need to log in before you can accept an invite.</p>
            );
            return;
        }

        if (!uuid.validate(inviteID || "")) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        history.push(`${routes.CREATE}/server?inviteID=${inviteID!}`);
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const callback = (_event: any, data: { url: string }) => {
            openInvite(data.url);
        };
        ipcRenderer.on("open-url", callback);

        return () => {
            ipcRenderer.off("open-url", callback);
        };
    });

    useMemo(async () => {
        try {
            const res = await axios.get(
                "https://api.github.com/repos/vex-chat/privacy-policy/commits/main"
            );

            const lastSeen = DataStore.get("privacyPolicySHA") as string | null;

            if (lastSeen !== res.data.sha) {
                setModalContents(
                    <span>
                        There&apos;s been a privacy policy update. Click{" "}
                        <a
                            className="has-text-link"
                            onClick={() => {
                                shell.openExternal(
                                    "https://vex.chat/privacy-policy"
                                );
                            }}
                        >
                            here
                        </a>{" "}
                        to view it.
                    </span>
                );
            }
            DataStore.set("privacyPolicySHA", res.data.sha);
        } catch (err) {
            console.error(err);
        }
    }, [lastFetched]);

    useMemo(async () => {
        const res = await axios.get(
            "https://api.github.com/repos/vex-chat/vex-desktop/releases/latest"
        );
        if (
            semver.gt(res.data.tag_name, currentVersion) &&
            res.data.assets.length === 9
        ) {
            setUpdateAvailable(true);
        }
    }, [lastFetched]);

    const onUpdateStatus = (_event: Event, data: updateStatus) => {
        const { status } = data;
        switch (status) {
            case "checking":
                break;
            case "current":
                break;
            case "error":
                log.error(data);
                break;
            case "available":
                log.info("Update available.");
                history.push(routes.UPDATING);
                break;
            case "downloaded":
                log.info("Update has been downloaded.");
                break;
            case "progress":
                if (!history.location.pathname.includes(routes.UPDATING)) {
                    history.push(routes.UPDATING);
                }
                break;
            default:
                log.info(`updater: Don't know how to ${status as string}`);
                break;
        }
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ipcRenderer.on("autoUpdater", onUpdateStatus);

        return () => {
            ipcRenderer.off("autoUpdater", onUpdateStatus);
        };
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setLastFetched(Date.now());
        }, 1000 * 60 * 10);
        return () => {
            clearInterval(interval);
        };
    });

    return (
        <App>
            <TitleBar />
            {modalContents !== null && (
                <Modal
                    close={() => {
                        setModalContents(null);
                    }}
                    active={true}
                    showCancel={false}
                    acceptText={"OK"}
                >
                    {modalContents}
                </Modal>
            )}
            <Switch>
                <Route
                    path={routes.MESSAGING + "/:userID?/:page?/:sessionID?"}
                    render={() => (
                        <Messaging updateAvailable={updateAvailable} />
                    )}
                />
                <Route
                    path={
                        routes.SERVERS +
                        "/:serverID?/:pageType/:channelID?/:channelPage?"
                    }
                    render={() => <Server updateAvailable={updateAvailable} />}
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
                <Route
                    path={routes.UPDATING}
                    render={() => <Loading size={256} animation={"cylon"} />}
                />
            </Switch>
        </App>
    );
}

export function Modal(props: {
    children: JSX.Element;
    active: boolean;
    onAccept?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
    cancelText?: string;
    acceptText?: string;
    close: () => void;
}): JSX.Element {
    return (
        <div className={`modal ${props.active ? "is-active" : ""}`}>
            <div
                className="modal-background"
                onClick={() => {
                    props.close();
                }}
            ></div>
            <div className="modal-content box">
                {props.children}
                <br />
                <div className="buttons is-right">
                    {props.showCancel && (
                        <button
                            className="button is-plain"
                            onClick={() => {
                                if (props.onCancel) {
                                    props.onCancel();
                                }
                                props.close();
                            }}
                        >
                            {props.cancelText || "Cancel"}
                        </button>
                    )}

                    <button
                        className="button is-success"
                        onClick={() => {
                            if (props.onAccept) {
                                props.onAccept();
                            }
                            props.close();
                        }}
                    >
                        {props.acceptText || "OK"}
                    </button>
                </div>
            </div>
            <button
                className="modal-close is-large"
                aria-label="close"
                onClick={() => {
                    props.close();
                }}
            ></button>
        </div>
    );
}