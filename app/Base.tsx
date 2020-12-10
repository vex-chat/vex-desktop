import React, { useEffect } from "react";
import { remote } from "electron";
import { Switch, Route, useHistory } from "react-router-dom";
import { routes } from "./constants/routes";
import App from "./views/App";
import HomePage from "./views/HomePage";
import { Client, IMessage, IConversation } from "@vex-chat/vex-js";
import { useDispatch } from "react-redux";
import { setUser } from "./reducers/user";
import os from "os";
import { setFamiliars } from "./reducers/familiars";
import { setMessages } from "./reducers/messages";
import { addConversation, setConversations } from "./reducers/conversations";

const homedir = os.homedir();
export const progFolder = `${homedir}/.vex-desktop`;

// localStorage.setItem("PK", Client.generateSecretKey());

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const client = new Client(localStorage.getItem("PK")!, {
    dbFolder: progFolder,
});
client.on("ready", async () => {
    await client.register(Client.randomUsername());
    client.login();
});
client.init();

export interface IDisplayMessage extends IMessage {
    timestamp: Date;
    direction: "outgoing" | "incoming";
}

export default function Base(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        client.on("authed", async () => {
            const me = client.users.me();
            dispatch(setUser(me));

            const conversations = await client.conversations.retrieve();
            dispatch(setConversations(conversations));

            const familiars = await client.familiars.retrieve();
            dispatch(setFamiliars(familiars));

            for (const user of familiars) {
                const history = await client.messages.retrieve(user.userID);
                for (const message of history) {
                    dispatch(setMessages(message));
                }
            }
        });

        client.on("conversation", async (conversation: IConversation) => {
            dispatch(addConversation(conversation));
        });

        client.on("message", async (message: IMessage) => {
            const dispMsg: IDisplayMessage = {
                message: message.message,
                recipient: message.recipient,
                nonce: message.nonce,
                timestamp: message.timestamp,
                sender: message.sender,
                direction: message.direction,
            };
            dispatch(setMessages(dispMsg));

            if (
                dispMsg.direction === "incoming" &&
                message.recipient !== message.sender
            ) {
                const msgNotification = new Notification("Vex", {
                    body: "You've got a new message.",
                });

                msgNotification.onclick = () => {
                    remote.getCurrentWindow().show();
                    history.push(
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
            <Switch>
                <Route path={routes.HOME} component={HomePage} />
            </Switch>
        </App>
    );
}
