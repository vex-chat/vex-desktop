import type { ISerializedMessage } from "../reducers/messages";

import { XUtils } from "@vex-chat/crypto";

import {
    faDownload,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { remote } from "electron";
import log from "electron-log";
import fs from "fs";
import levenshtein from "js-levenshtein";
import path from "path";
import { Fragment } from "react";
import { useSelector } from "react-redux";
import nacl from "tweetnacl";
import * as uuid from "uuid";

import { allowedHighlighterTypes } from "../constants/allowedHighlighterTypes";
import { mimeIcons } from "../constants/mimeIcons";
import { selectFamiliars } from "../reducers/familiars";

import { Avatar } from "./Avatar";
import { FamiliarMenu } from "./FamiliarMenu";
import { Highlighter } from "./Highlighter";

const RESOURCES_PATH = remote.app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../assets");

export const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
};

console.log(RESOURCES_PATH);

const bestMatch = (mimeType: string): string => {
    let bestMatch = "";
    let lowestScore = 999999;

    mimeIcons.forEach((file) => {
        const distance = levenshtein(mimeType.replace("/", "-"), file);

        if (distance < lowestScore) {
            lowestScore = distance;
            bestMatch = file;
        }
    });

    return getAssetPath("mimeIcons/" + bestMatch);
};

export function MessageBox(props: {
    messages: ISerializedMessage[];
}): JSX.Element {
    const familiars = useSelector(selectFamiliars);

    // don't match no characters of any length
    const codeRegex = /(```[^]+```)/;
    const fileRegex = /{{[^]+}}/;
    const sender = familiars[props.messages[0]?.authorID] || null;

    if (!sender) {
        return <p key={uuid.v4()} />;
    }

    if (props.messages.length == 0) {
        return <span key={XUtils.encodeHex(nacl.randomBytes(16))} />;
    }

    return (
        <article className="chat-message media" key={props.messages[0].nonce}>
            <figure className="media-left">
                <FamiliarMenu
                    trigger={
                        <p className="image is-48x48">
                            <Avatar user={sender} />
                        </p>
                    }
                    familiar={sender}
                />
            </figure>
            <div className="media-content">
                <div className="content message-wrapper">
                    <strong>{sender.username || "Unknown User"}</strong>
                    &nbsp;&nbsp;
                    <small className="has-text-dark">
                        {format(
                            new Date(props.messages[0].timestamp),
                            "kk:mm MM/dd/yyyy"
                        )}
                    </small>
                    &nbsp;&nbsp;
                    <br />
                    {props.messages.map((message) => {
                        const isCode = codeRegex.test(message.message);
                        const isFile = fileRegex.test(message.message);

                        if (isCode) {
                            // removing ```
                            const languageInput = message.message
                                .replace(/```/g, "")
                                .split("\n")[0]
                                .trim();

                            if (
                                allowedHighlighterTypes.includes(languageInput)
                            ) {
                                return (
                                    <div
                                        className="message-code"
                                        key={message.nonce}
                                    >
                                        {Highlighter(
                                            message.message
                                                .replace(/```/g, "")
                                                .replace(languageInput, "")
                                                .trim(),
                                            languageInput,
                                            message.nonce
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div
                                    className="message-code"
                                    key={message.nonce}
                                >
                                    {Highlighter(
                                        message.message
                                            .replace(/```/g, "")
                                            .trim(),
                                        null
                                    )}
                                </div>
                            );
                        }

                        if (isFile) {
                            const {
                                name,
                                fileID,
                                key,
                                type,
                            } = parseFileMessage(message.message);
                            return (
                                <div
                                    key={message.nonce}
                                    className="file-wrapper"
                                >
                                    <span
                                        className="message-text box file-box pointer"
                                        onClick={async () => {
                                            const client = window.vex;
                                            const file = await client.files.retrieve(
                                                fileID,
                                                key
                                            );

                                            const dialogRes = await remote.dialog.showSaveDialog(
                                                remote.getCurrentWindow(),
                                                {
                                                    title:
                                                        "Save Decrypted File",
                                                    buttonLabel: "Save",
                                                    defaultPath: name,
                                                }
                                            );
                                            const {
                                                canceled,
                                                filePath,
                                            } = dialogRes;
                                            if (
                                                canceled ||
                                                !file ||
                                                !filePath
                                            ) {
                                                return;
                                            }
                                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                            fs.writeFile(
                                                filePath,
                                                file.data,
                                                () => {
                                                    log.debug(
                                                        `File downloaded to ${filePath}`
                                                    );
                                                }
                                            );
                                        }}
                                    >
                                        <article className="media">
                                            <figure className="media-left">
                                                <span className="image is-48x48">
                                                    <img
                                                        src={bestMatch(
                                                            type || "unknown"
                                                        )}
                                                    />
                                                </span>
                                            </figure>
                                            <div className="media-content">
                                                <div className="content">
                                                    <span className="help file-label">
                                                        {name.length > 20
                                                            ? name.slice(
                                                                  0,
                                                                  20
                                                              ) + "..."
                                                            : name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="media-right">
                                                <div className="icon is-large">
                                                    <FontAwesomeIcon
                                                        icon={faDownload}
                                                    />
                                                </div>
                                            </div>
                                        </article>
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <Fragment key={message.nonce}>
                                <p className="message-text">
                                    {!message.decrypted && (
                                        <code>Decryption Failed</code>
                                    )}
                                    {message.failed ? (
                                        <span className="has-text-danger">
                                            {message.message}
                                        </span>
                                    ) : (
                                        <span
                                            className={`${
                                                message.message.charAt(0) ===
                                                ">"
                                                    ? "has-text-success has-text-weight-bold"
                                                    : ""
                                            }`}
                                        >
                                            {message.decrypted &&
                                                message.message}
                                        </span>
                                    )}
                                    &nbsp;&nbsp;
                                    {message.failed && (
                                        <span className="help has-text-danger">
                                            <FontAwesomeIcon
                                                icon={faExclamationTriangle}
                                            />{" "}
                                            Failed: {message.failMessage}{" "}
                                        </span>
                                    )}
                                </p>
                            </Fragment>
                        );
                    })}
                </div>
            </div>
            <div className="media-right" />
        </article>
    );
}

interface IParsedFile {
    name: string;
    fileID: string;
    key: string;
    type: string;
}

const parseFileMessage = (fileStr: string): IParsedFile => {
    const innerStr = fileStr.replace(/[{{{}}}]/g, "");
    const strParts = innerStr.split(":");

    const [name, fileID, key, type] = strParts;
    return { name, fileID, key, type };
};
