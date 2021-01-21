import type { ISerializedMessage } from "../reducers/messages";

import { XUtils } from "@vex-chat/crypto";

import {
    faDownload,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { remote, shell } from "electron";
import log from "electron-log";
import fs from "fs";
import levenshtein from "js-levenshtein";
import Linkify from "linkify-it";
import path from "path";
import { Fragment, useMemo, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import reactStringReplace from "react-string-replace";
import nacl from "tweetnacl";
import * as uuid from "uuid";

import Loading from "../components/Loading";
import { allowedHighlighterTypes, mimeIcons } from "../constants";
import { selectFamiliars } from "../reducers/familiars";
import { getFiles, set as setFile } from "../reducers/files";
import { selectUser } from "../reducers/user";
import { getAssetPath } from "../utils/getAssetPath";
import { mentionRegex } from "../utils/regexes";

import { LinkRenderer } from "./renderers/Link";
import Avatar from "./Avatar";
import { FamiliarMenu } from "./FamiliarMenu";
import { Highlighter } from "./Highlighter";

const linkify = new Linkify();

export const bestMatch = (query: string, values: string[]): string => {
    let bestMatch = "";
    let lowestScore = 999999;

    values.forEach((value) => {
        const distance = levenshtein(query.replace("/", "-"), value);

        if (distance < lowestScore) {
            lowestScore = distance;
            bestMatch = value;
        }
    });

    return bestMatch;
};

export function MessageBox(props: {
    messages: ISerializedMessage[];
}): JSX.Element {
    const familiars = useSelector(selectFamiliars);
    // don't match no characters of any length
    const codeRegex = /(```[^]+```)/;
    const fileRegex = /{{[^ \n]+}}/;
    const emojiRegex = /(<<[^ \n]+>>)/;
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
                    <small className="dim">
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
                            return (
                                <FileBox
                                    key={message.nonce}
                                    message={message}
                                />
                            );
                        }

                        return (
                            <Fragment key={message.nonce}>
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
                                            message.message.charAt(0) === ">"
                                                ? "has-text-success has-text-weight-bold"
                                                : ""
                                        }`}
                                    >
                                        {message.decrypted &&
                                            reactStringReplace(
                                                reactStringReplace(
                                                    message.message,
                                                    mentionRegex,
                                                    (match) => (
                                                        <Mention
                                                            match={match}
                                                            message={message}
                                                        />
                                                    )
                                                ),
                                                emojiRegex,
                                                (match) => (
                                                    <MessageEmoji
                                                        match={match}
                                                    />
                                                )
                                            ).map((node) => {
                                                if (typeof node === "string") {
                                                    if (linkify.test(node)) {
                                                        const matches = linkify.match(
                                                            node
                                                        );
                                                        let strMessage = "";
                                                        if (matches) {
                                                            for (const match of matches) {
                                                                strMessage += node.replace(
                                                                    match.text,
                                                                    `[${match.text}](${match.url})`
                                                                );
                                                            }
                                                        }
                                                        return (
                                                            <ReactMarkdown
                                                                disallowedTypes={[
                                                                    "blockquote",
                                                                    "code",
                                                                    "inlineCode",
                                                                    "list",
                                                                    "listItem",
                                                                    "image",
                                                                ]}
                                                                unwrapDisallowed={
                                                                    true
                                                                }
                                                                renderers={{
                                                                    link: LinkRenderer,
                                                                }}
                                                            >
                                                                {strMessage}
                                                            </ReactMarkdown>
                                                        );
                                                    }

                                                    return (
                                                        <ReactMarkdown
                                                            disallowedTypes={[
                                                                "blockquote",
                                                                "code",
                                                                "inlineCode",
                                                                "list",
                                                                "listItem",
                                                                "image",
                                                            ]}
                                                            unwrapDisallowed={
                                                                true
                                                            }
                                                            className="message-text"
                                                        >
                                                            {node}
                                                        </ReactMarkdown>
                                                    );
                                                }
                                                return node;
                                            })}
                                    </span>
                                )}
                                {message.failed && (
                                    <span className="help has-text-danger">
                                        <FontAwesomeIcon
                                            icon={faExclamationTriangle}
                                        />{" "}
                                        Failed: {message.failMessage}{" "}
                                    </span>
                                )}
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

const allowedAudioTypes = [
    "audio/wav",
    "audio/mpeg",
    "audio/mp4",
    "audio/aac",
    "audio/aacp",
    "audio/ogg",
    "audio/webm",
    "audio/flac",
];
const allowedImageTypes = [
    "image/apng",
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
];

export function Emoji(props: { emojiStr: string }): JSX.Element {
    console.log(props);
    return <span>{props.emojiStr}</span>;
}

export function FileBox(props: { message: ISerializedMessage }): JSX.Element {
    const [downloading, setDownloading] = useState(false);
    const [previewSrc, setPreviewSrc] = useState("");
    const dispatch = useDispatch();
    const [audioSrc, setAudioSrc] = useState("");
    const files = useSelector(getFiles());
    const [fullSizePreview, setFullSizePreview] = useState(false);
    const parsed = parseFileMessage(props.message.message);
    const { name, fileID, key, type } = parsed;

    const download = async () => {
        if (downloading) {
            log.warn("Already downloading file.");
            return;
        }
        setDownloading(true);

        try {
            const client = window.vex;
            const file = await client.files.retrieve(fileID, key);
            setDownloading(false);

            const dialogRes = await remote.dialog.showSaveDialog(
                remote.getCurrentWindow(),
                {
                    title: "Save Decrypted File",
                    buttonLabel: "Save",
                    defaultPath: remote.app.getPath("downloads") + "/" + name,
                }
            );
            const { canceled, filePath } = dialogRes;
            if (canceled || !file || !filePath) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            fs.writeFile(filePath, file.data, () => {
                log.debug(`File downloaded to ${filePath}`);
                shell.openPath(path.resolve(filePath));
            });
        } catch (err) {
            log.warn(err.toString());
            setDownloading(false);
        }
    };

    useMemo(async () => {
        if (type && type.includes("image")) {
            if (files[fileID]) {
                setPreviewSrc(
                    "data:" +
                        bestMatch(type, allowedImageTypes) +
                        ";base64," +
                        files[fileID]
                );
                return;
            }

            const client = window.vex;
            try {
                const fileRes = await client.files.retrieve(fileID, key);
                if (fileRes) {
                    setPreviewSrc(
                        "data:" +
                            bestMatch(type, allowedImageTypes) +
                            ";base64," +
                            fileRes.data.toString("base64")
                    );
                    dispatch(
                        setFile({
                            fileID,
                            data: fileRes.data.toString("base64"),
                        })
                    );
                }
            } catch (err) {
                console.warn(err.toString());
            }
        }

        if (type && type.includes("audio")) {
            if (files[fileID]) {
                setAudioSrc(
                    "data:" +
                        bestMatch(type, allowedAudioTypes) +
                        ";base64," +
                        files[fileID]
                );
                return;
            }

            const client = window.vex;
            try {
                const fileRes = await client.files.retrieve(fileID, key);
                if (fileRes) {
                    setAudioSrc(
                        "data:" +
                            bestMatch(type, allowedAudioTypes) +
                            ";base64," +
                            fileRes.data.toString("base64")
                    );
                    dispatch(
                        setFile({
                            fileID,
                            data: fileRes.data.toString("base64"),
                        })
                    );
                }
            } catch (err) {
                console.warn(err.toString());
            }
        }
    }, []);

    if (previewSrc !== "") {
        return (
            <Fragment>
                <div className={`modal ${fullSizePreview ? "is-active" : ""}`}>
                    <div
                        className="modal-background"
                        onClick={() => {
                            console.log("Clicked background.");
                            setFullSizePreview(false);
                        }}
                    ></div>
                    <div className="modal-content has-text-centered image-preview-modal">
                        <div className="modal-content-button-wrapper has-text-right">
                            <img src={previewSrc} />
                            <br />
                            <a onClick={download}>
                                <p className="dim">Download</p>
                            </a>
                        </div>
                    </div>
                    <button
                        className="modal-close is-large"
                        aria-label="close"
                        onClick={() => {
                            console.log("Clicked close.");
                            setFullSizePreview(false);
                        }}
                    ></button>
                </div>
                <div
                    className="image-preview-wrapper pointer"
                    onClick={() => {
                        setFullSizePreview(true);
                    }}
                >
                    <img
                        src={previewSrc}
                        onError={() => {
                            setPreviewSrc("");
                        }}
                    />
                </div>
            </Fragment>
        );
    }

    return (
        <div key={props.message.nonce} className="file-wrapper">
            <span className="message-text box file-box">
                <article className="media">
                    <figure className="media-left">
                        <span className="image is-48x48">
                            <img
                                src={getAssetPath(
                                    "mimeIcons/" +
                                        bestMatch(type || "unknown", mimeIcons)
                                )}
                            />
                        </span>
                    </figure>
                    <div className="media-content">
                        <div className="content">
                            <span className="file-label">
                                {name.length > 20
                                    ? name.slice(0, 20) + "..."
                                    : name}
                            </span>
                        </div>
                    </div>
                    <div className="media-right pointer" onClick={download}>
                        {downloading ? (
                            <Loading
                                size={60}
                                animation={"bubbles"}
                                color={"hsl(0, 0%, 71%)"}
                                className={"download-file-spinner"}
                            />
                        ) : (
                            <div className="icon is-size-3 download-icon">
                                <FontAwesomeIcon icon={faDownload} />
                            </div>
                        )}
                    </div>
                </article>
                {audioSrc !== "" && (
                    <div className="content audio-wrapper">
                        <AudioPlayer src={audioSrc} />
                        &nbsp;
                    </div>
                )}
            </span>
        </div>
    );
}

export function Mention(props: {
    message: ISerializedMessage;
    match: string;
}): JSX.Element {
    const familiars = useSelector(selectFamiliars);
    const user = useSelector(selectUser);

    return (
        <code
            key={props.message.nonce}
            className={`is-small mention-wrapper has-text-weight-bold`}
        >
            <span
                className={`mention-wrapper-overlay ${
                    familiars[props.match.replace(/[@<>]/g, "")]?.userID ==
                        user.userID &&
                    Date.now() - new Date(props.message.timestamp).getTime() <
                        5000
                        ? "my-mention"
                        : ""
                }`}
            />
            <span className={`mention-text has-text-link`}>
                {"@"}
                {familiars[props.match.replace(/[@<>]/g, "")]?.username ||
                    "Unknown"}
            </span>
        </code>
    );
}

export function MessageEmoji(props: { match: string }): JSX.Element {
    const parts = props.match.split(":").pop();
    if (!parts) {
        return <strong />;
    }
    const emojiID = parts.slice(0, parts.length - 2);

    return (
        <img className="emoji" src={"https://api.vex.chat/emoji/" + emojiID} />
    );
}
