import type { IServerParams } from "~Types";
import type {
    IGroupSerializedMessage,
    ISerializedMessage,
} from "../reducers/messages";

import {
    faArrowAltCircleDown,
    faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import crypto from "crypto";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import * as uuid from "uuid";

import { selectGroup } from "../reducers/groupMessages";
import { set as setOnlineList } from "../reducers/onlineLists";
import { chunkMessages } from "../utils/chunkMessages";

import { ChatInput } from "./ChatInput";
import { MessageBox } from "./MessageBox";

export function ServerPane(props: {
    userBarOpen: boolean;
    outboxMessages: string[];
    setOutboxMessages: (arr: string[]) => void;
}): JSX.Element {
    const { channelID } = useParams<IServerParams>();
    const threadMessages = useSelector(selectGroup(channelID));
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();

    const [lastFetch, setLastFetch] = useState(Date.now());
    const [scrollLock, setScrollLock] = useState(true);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView();
        }
    };

    const getOnlineList = async () => {
        console.log("GETTING ONLINE LIST");
        const client = window.vex;
        if (channelID) {
            try {
                const userList = await client.channels.userList(channelID);
                dispatch(setOnlineList({ channelID, userList }));
            } catch (err) {
                console.log(err);
            }
        }
    };

    useMemo(() => {
        getOnlineList();
    }, [channelID]);

    useMemo(() => {
        getOnlineList();
    }, [lastFetch]);

    useEffect(() => {
        if (scrollLock) {
            scrollToBottom();
        }

        const interval = setInterval(() => {
            setLastFetch(Date.now());
        }, 1000 * 30);
        return () => {
            clearInterval(interval);
        };
    });

    return (
        <Fragment>
            <div
                className="conversation-wrapper"
                onScroll={(event) => {
                    const chatWindowHeight = (event.target as HTMLInputElement)
                        .offsetHeight;
                    const scrollHeight = (event.target as HTMLInputElement)
                        .scrollHeight;
                    const scrollTop = (event.target as HTMLInputElement)
                        .scrollTop;
                    const vScrollPosition =
                        scrollHeight - (scrollTop + chatWindowHeight);

                    if (vScrollPosition === 0) {
                        setScrollLock(true);
                    }

                    if (vScrollPosition > 150) {
                        setScrollLock(false);
                    }
                }}
            >
                {channelID !== undefined && (
                    <div className={"history-disclaimer"}>
                        <p className="help">
                            <FontAwesomeIcon icon={faStar} /> For your security,
                            message history is not transferred to new devices.
                            <FontAwesomeIcon icon={faStar} />{" "}
                        </p>
                    </div>
                )}

                {chunkMessages(
                    { ...threadMessages, ...msgify(props.outboxMessages) } || {}
                ).map((chunk) => {
                    return (
                        <MessageBox
                            key={chunk[0]?.mailID || uuid.v4()}
                            messages={chunk}
                            outboxMessages={props.outboxMessages}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {channelID && (
                <ChatInput
                    targetID={channelID}
                    userBarOpen={props.userBarOpen}
                    outboxMessages={props.outboxMessages}
                    setOutboxMessages={props.setOutboxMessages}
                    group
                />
            )}
            {!scrollLock && (
                <div className="conversation-fab">
                    <FontAwesomeIcon
                        icon={faArrowAltCircleDown}
                        onClick={() => {
                            scrollToBottom();
                            setScrollLock(true);
                        }}
                    />
                </div>
            )}
        </Fragment>
    );
}

export const msgify = (
    outbox: string[]
): Record<string, ISerializedMessage> => {
    const outboxRecord: Record<string, IGroupSerializedMessage> = {};
    const client = window.vex;
    for (const message of outbox) {
        const msg: ISerializedMessage = {
            nonce: crypto.randomBytes(24).toString("hex"),
            mailID: uuid.v4(),
            sender: client.me.device().deviceID,
            recipient: "",
            decrypted: true,
            timestamp: new Date(Date.now()).toString(),
            group: uuid.v4(),
            message,
            direction: "outgoing",
            failed: false,
            authorID: client.me.user().userID,
            readerID: "",
            forward: false,
            failMessage: "",
            outbox: true,
        };
        outboxRecord[msg.mailID] = msg;
    }
    return outboxRecord;
};
