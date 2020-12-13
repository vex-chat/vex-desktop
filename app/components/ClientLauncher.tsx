import { Client, IMessage, ISession, IUser } from "@vex-chat/vex-js";
import { remote } from "electron";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { routes } from "../constants/routes";
import { resetApp, setApp } from "../reducers/app";
import { addFamiliar, setFamiliars } from "../reducers/familiars";
import { addMessage, resetMessages } from "../reducers/messages";
import { addSession, setSessions } from "../reducers/sessions";
import { selectSettings } from "../reducers/settings";
import { setUser } from "../reducers/user";
import os from "os";
import { resetInputStates } from "../reducers/inputs";

const homedir = os.homedir();
export const progFolder = `${homedir}/.vex-desktop`;
export let client: Client;

export function initClient(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const PK = localStorage.getItem("PK")!;
    client = new Client(PK, {
        dbFolder: progFolder,
        logLevel: "info",
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
    client.on("closed", async () => {
        console.log("Shut down manually.");
    });
    client.init();
}

function objifySessions(sessions: ISession[]): Record<string, ISession[]> {
    const sessionsObj: Record<string, ISession[]> = {};

    for (const sess of sessions) {
        if (sessionsObj[sess.userID] === undefined) {
            sessionsObj[sess.userID] = [];
        }
        sessionsObj[sess.userID].push(sess);
    }
    return sessionsObj;
}

export function ClientLauncher(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();
    const settings = useSelector(selectSettings);

    useEffect(() => {
        initClient();

        // this is hacky fix this
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.on("needs-register" as any, async () => {
            history.push("/register");
        });

        client.on("authed", async () => {
            dispatch(setApp("initialLoad", true));
            const me = client.users.me();
            dispatch(setUser(me));

            history.push(routes.MESSAGING + "/" + me.userID);

            const sessions = await client.sessions.retrieve();
            dispatch(setSessions(objifySessions(sessions)));

            const familiars = await client.users.familiars();
            dispatch(setFamiliars(familiars));

            for (const user of familiars) {
                const history = await client.messages.retrieve(user.userID);
                for (const message of history) {
                    dispatch(addMessage(message));
                }
            }
            dispatch(setApp("initialLoad", false));
        });

        client.on("disconnect", async () => {
            await client.close();
            dispatch(resetApp);
            dispatch(resetInputStates);
            dispatch(resetMessages);

            history.push(routes.LAUNCH);
        });

        client.on("session", async (session: ISession, user: IUser) => {
            dispatch(addSession(session));
            dispatch(addFamiliar(user));
        });

        client.on("message", async (message: IMessage) => {
            dispatch(addMessage(message));

            if (
                settings.notifications &&
                message.direction === "incoming" &&
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
                            (message.direction === "incoming"
                                ? message.sender
                                : message.recipient)
                    );
                };
            }
        });
    });
    return <div />;
}
