import type { IServerParams } from "~Types";

import { faArrowCircleDown, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import * as uuid from "uuid";

import { selectGroup } from "../reducers/groupMessages";
import { set as setOnlineList } from "../reducers/onlineLists";
import { chunkMessages } from "../utils/chunkMessages";

import { ChatInput } from "./ChatInput";
import { MessageBox } from "./MessageBox";

export function ServerPane(): JSX.Element {
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

    useMemo(async () => {
        const client = window.vex;
        if (channelID) {
            try {
                const userList = await client.channels.userList(channelID);
                dispatch(setOnlineList({ channelID, userList }));
            } catch (err) {
                console.log(err);
            }
        }
    }, [channelID, lastFetch]);

    useEffect(() => {
        if (scrollLock) {
            scrollToBottom();
        }

        const interval = setInterval(() => {
            setLastFetch(Date.now());
        }, 1000 * 60);
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

                {chunkMessages(threadMessages || {}).map((chunk) => {
                    return (
                        <MessageBox
                            key={chunk[0]?.mailID || uuid.v4()}
                            messages={chunk}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {channelID && <ChatInput targetID={channelID} group />}
            {!scrollLock && (
                <div className="conversation-fab">
                    <FontAwesomeIcon
                        icon={faArrowCircleDown}
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
