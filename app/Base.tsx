import React, { useEffect } from "react";
import { remote } from "electron";
import { Switch, Route, useHistory } from "react-router-dom";
import { routes } from "./constants/routes";
import App from "./views/App";
import HomePage from "./views/HomePage";
import { Client, IMessage } from "@vex-chat/vex-js";
import { useDispatch } from "react-redux";
import { setUser } from "./reducers/user";
import os from "os";
import { setFamiliars } from "./reducers/familiars";
import { setMessages } from "./reducers/messages";
import { xMnemonic, XUtils } from "@vex-chat/crypto-js";
import crypto from "crypto";

function randomUsername() {
    const IKM = XUtils.decodeHex(crypto.randomBytes(16).toString("hex"));
    const mnemonic = xMnemonic(IKM).split(" ");
    const number = Math.floor(Math.random() * 1000);

    return (
        capitalize(mnemonic[0]) + capitalize(mnemonic[1]) + number.toString()
    );
}

const homedir = os.homedir();
export const progFolder = `${homedir}/.vex-desktop`;

const capitalize = (s: string): string => {
    return s.charAt(0).toUpperCase() + s.slice(1);
};

// localStorage.setItem("PK", Client.generateSecretKey());

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const client = new Client(localStorage.getItem("PK")!, {
    dbFolder: progFolder,
});
client.on("ready", async () => {
    await client.register(randomUsername());
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

            const familiars = await client.familiars.retrieve();
            dispatch(setFamiliars(familiars));

            for (const user of familiars) {
                const history = await client.messages.retrieve(user.userID);
                for (const message of history.map((row) => {
                    row.timestamp = new Date(row.timestamp);
                    return row;
                })) {
                    dispatch(setMessages(message));
                }
            }
        });

        client.on("message", async (message: IMessage) => {
            console.log(message.direction, typeof message.timestamp);

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
