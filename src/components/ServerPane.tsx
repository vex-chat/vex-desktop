import type { IServerParams } from "~Types";

import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

import { selectGroup } from "../reducers/groupMessages";

import { ChatInput } from "./ChatInput";
import { MessageBox } from "./MessageBox";

export function ServerPane(): JSX.Element {
    const { channelID } = useParams<IServerParams>();
    const threadMessages = useSelector(selectGroup(channelID));
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView();
        }
    };

    useEffect(() => {
        scrollToBottom();
    });

    return (
        <Fragment>
            <div className="conversation-wrapper">
                <div className={"history-disclaimer"}>
                    <p className="help">
                        <FontAwesomeIcon icon={faStar} /> For your security,
                        message history is not transferred to new devices.
                        <FontAwesomeIcon icon={faStar} />{" "}
                    </p>
                </div>
                {Object.keys(threadMessages || {}).map((key) => (
                    <MessageBox key={key} messages={[threadMessages[key]]} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {channelID && <ChatInput targetID={channelID} group />}
        </Fragment>
    );
}
