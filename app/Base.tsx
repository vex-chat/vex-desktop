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
            dispatch(setUser(client.users.me()));
            dispatch(setFamiliars(await client.familiars.retrieve()));
        });

        client.on("message", async (message: IMessage) => {
            const dispMsg: IDisplayMessage = {
                message: message.message,
                recipient: message.recipient,
                nonce: message.nonce,
                timestamp: new Date(Date.now()),
                sender: message.sender,
                direction: message.direction,
            };

            dispatch(setMessages(dispMsg));

            if (dispMsg.direction === "incoming") {
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
