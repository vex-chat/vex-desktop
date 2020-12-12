import React, { useEffect } from "react";
import { remote } from "electron";
import { Switch, Route, useHistory } from "react-router-dom";
import { routes } from "../constants/routes";
import App from "../views/App";
import Messaging from "../views/Messaging";
import { Client, IMessage, ISession, IUser } from "@vex-chat/vex-js";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../reducers/user";
import os from "os";
import { addFamiliar, setFamiliars } from "../reducers/familiars";
import { addMessage } from "../reducers/messages";
import { addSession, setSessions } from "../reducers/sessions";
import Register from "../views/Register";
import Loading from "../components/Loading";
import Settings from "../views/Settings";
import { selectSettings } from "../reducers/settings";
import { setApp } from "../reducers/app";

const homedir = os.homedir();
export const progFolder = `${homedir}/.vex-desktop`;

export let client: Client;

export const switchFX = new Audio("assets/sounds/switch_005.ogg");
switchFX.load();

export const errorFX = new Audio("assets/sounds/error_008.ogg");
errorFX.load();

export function initClient(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    client = new Client(localStorage.getItem("PK")!, {
        dbFolder: progFolder,
    });
    client.on("ready", async () => {
        const registeredUser = await client.users.retrieve(
            client.getKeys().public
        );
        if (registeredUser) {
            await client.login();
        } else {
            // hacky
            client.emit("needs-register");
        }
    });
    // emitted when manually closed
    client.on("close", async () => {
        console.log("Shut down.");
    });
    client.init();
}

initClient();

export interface IDisplayMessage extends IMessage {
    timestamp: Date;
    direction: "outgoing" | "incoming";
}

export default function Base(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();
    const settings = useSelector(selectSettings);

    useEffect(() => {
        client.on("needs-register", async () => {
            history.push("/register");
        });

        client.on("authed", async () => {
            const me = client.users.me();
            dispatch(setUser(me));

            if (history.location.pathname === "/") {
                history.push(routes.MESSAGING + "/" + me.userID);
            }

            const conversations = await client.conversations.retrieve();
            dispatch(setSessions(conversations));

            const familiars = await client.familiars.retrieve();
            dispatch(setFamiliars(familiars));

            for (const user of familiars) {
                const history = await client.messages.retrieve(user.userID);
                for (const message of history) {
                    dispatch(addMessage(message));
                }
            }
            dispatch(setApp("initialLoad", false));
        });

        client.on(
            "conversation",
            async (conversation: ISession, user: IUser) => {
                dispatch(addSession(conversation));
                dispatch(addFamiliar(user));
            }
        );

        client.on("message", async (message: IMessage) => {
            const dispMsg: IDisplayMessage = {
                message: message.message,
                recipient: message.recipient,
                nonce: message.nonce,
                timestamp: message.timestamp,
                sender: message.sender,
                direction: message.direction,
            };
            dispatch(addMessage(dispMsg));

            if (
                settings.notifications &&
                dispMsg.direction === "incoming" &&
                message.recipient !== message.sender
            ) {
                const msgNotification = new Notification("Vex", {
                    body: message.message,
                });

                msgNotification.onclick = () => {
                    remote.getCurrentWindow().show();
                    history.push(
                        routes.MESSAGING +
                            "/" +
                            (dispMsg.direction === "incoming"
                                ? dispMsg.sender
                                : dispMsg.recipient)
                    );
                };
            }
        });
    });

    return (
        <App>
            <div className="title-bar" />
            <Switch>
                <Route
                    path={routes.MESSAGING + "/:userID/:page?/:sessionID?"}
                    component={Messaging}
                />
                <Route path={routes.REGISTER} component={Register} />
                <Route path={routes.SETTINGS} component={Settings} />
                <Route exact path={"/"} component={() => Loading(256)} />
            </Switch>
        </App>
    );
}
