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
import path from "path";
import { Fragment, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import reactStringReplace from "react-string-replace";
import nacl from "tweetnacl";
import * as uuid from "uuid";

import Loading from "../components/Loading";
import { allowedHighlighterTypes } from "../constants/allowedHighlighterTypes";
import { mimeIcons } from "../constants/mimeIcons";
import { selectFamiliars } from "../reducers/familiars";
import { getFiles, set as setFile } from "../reducers/files";
import { getAssetPath } from "../utils/getAssetPath";

import Avatar from "./Avatar";
import { FamiliarMenu } from "./FamiliarMenu";
import { Highlighter } from "./Highlighter";

const mentionRegex = /(@<[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}>)/gi;

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
                            return <FileBox message={message} />;
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
                                                reactStringReplace(
                                                    message.message.trim(),
                                                    mentionRegex,
                                                    (match) => (
                                                        <code
                                                            key={message.nonce}
                                                            className={`is-small mention-wrapper has-text-weight-bold`}
                                                        >
                                                            <span
                                                                className={`mention-wrapper-overlay has-background-link`}
                                                            />
                                                            <span
                                                                className={`mention-text has-text-link`}
                                                            >
                                                                {"@"}
                                                                {familiars[
                                                                    match.replace(
                                                                        /[@<>]/g,
                                                                        ""
                                                                    )
                                                                ]?.username ||
                                                                    "Unknown"}
                                                            </span>
                                                        </code>
                                                    )
                                                )}
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

export function FileBox(props: { message: ISerializedMessage }): JSX.Element {
    const [downloading, setDownloading] = useState(false);
    const [previewSrc, setPreviewSrc] = useState("");
    const dispatch = useDispatch();
    const [audioSrc, setAudioSrc] = useState("");
    const files = useSelector(getFiles());
    const [fullSizePreview, setFullSizePreview] = useState(false);
    const parsed = parseFileMessage(props.message.message);
    const { name, fileID, key, type } = parsed;

    useMemo(async () => {
        if (type.includes("image")) {
            if (files[fileID]) {
                console.log("Found in local cache.");
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

        if (type.includes("audio")) {
            if (files[fileID]) {
                console.log("Found in local cache.");
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
            <div className="image-preview-wrapper">
                <img
                    src={previewSrc}
                    onError={() => {
                        setPreviewSrc("");
                    }}
                />
            </div>
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
                        {audioSrc !== "" ? (
                            <div className="content has-text-centered">
                                <span className="help file-label">
                                    {name.length > 20
                                        ? name.slice(0, 20) + "..."
                                        : name}
                                </span>
                                <audio
                                    controls
                                    src={audioSrc}
                                    onError={(event) => {
                                        console.log(event);
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="content">
                                <span className="help file-label">
                                    {name.length > 20
                                        ? name.slice(0, 20) + "..."
                                        : name}
                                </span>
                            </div>
                        )}
                    </div>
                    {audioSrc === "" && (
                        <div
                            className="media-right pointer"
                            onClick={async () => {
                                if (downloading) {
                                    log.warn("Already downloading file.");
                                    return;
                                }
                                setDownloading(true);

                                try {
                                    const client = window.vex;
                                    const file = await client.files.retrieve(
                                        fileID,
                                        key
                                    );
                                    setDownloading(false);

                                    const dialogRes = await remote.dialog.showSaveDialog(
                                        remote.getCurrentWindow(),
                                        {
                                            title: "Save Decrypted File",
                                            buttonLabel: "Save",
                                            defaultPath:
                                                remote.app.getPath(
                                                    "downloads"
                                                ) +
                                                "/" +
                                                name,
                                        }
                                    );
                                    const { canceled, filePath } = dialogRes;
                                    if (canceled || !file || !filePath) {
                                        return;
                                    }
                                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                    fs.writeFile(filePath, file.data, () => {
                                        log.debug(
                                            `File downloaded to ${filePath}`
                                        );
                                        shell.openPath(path.resolve(filePath));
                                    });
                                } catch (err) {
                                    log.warn(err.toString());
                                    setDownloading(false);
                                }
                            }}
                        >
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
                    )}
                </article>
            </span>
        </div>
    );
}
