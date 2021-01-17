import type { IFile, IFileProgress } from "@vex-chat/libvex";
import type { EmojiData } from "emoji-mart";

import log from "electron-log";
import { emojiIndex } from "emoji-mart";
import FileType from "file-type";
import React, { useMemo, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import { errorFX } from "../constants/sounds";
import { fail as failGroup } from "../reducers/groupMessages";
import { failMessage } from "../reducers/messages";
import store from "../utils/DataStore";

import Loading from "./Loading";

const openEmojiRegex = /:\w+$/;
const closedEmojiRegex = /:\w+:/g;

export function ChatInput(props: {
    targetID: string;
    group?: boolean;
    className?: string;
    disabled?: boolean;
}): JSX.Element {
    const {
        userID,
        serverID,
        channelID,
    }: {
        userID: string | undefined;
        serverID: string | undefined;
        channelID: string | undefined;
    } = useParams();
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = useState("");
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState("00");
    const [loaded, setLoaded] = useState(0);
    const [total, setTotal] = useState(0);
    const [speed, setSpeed] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>();
    const [errText, setErrText] = useState("");
    const [matches, setMatches] = useState(null as RegExpExecArray | null);
    const [emoji, setEmoji] = useState([] as EmojiData[] | undefined);
    const [activeEmoji, setActiveEmoji] = useState(-1);

    const adjustInputHeight = (
        event?: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event && event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
        }

        if (inputRef.current) {
            inputRef.current.style.height = "inherit";
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    };

    const selectEmoji = (emoji: EmojiData, matchOverride?: string) => {
        if (!matches) {
            console.warn("No matches.");
            return;
        }
        const match = matchOverride || matches[0];
        setInputValue(
            inputValue.replace(match, (emoji as any).native + " " || ":X ")
        );
        setEmoji(undefined);
    };

    const resetInputHeight = () => {
        if (inputRef.current) {
            inputRef.current.style.height = "58px";
        }
    };

    const uploadFile = (fileDetails: File) => {
        setUploading(true);
        const { name, size } = fileDetails;
        const client = window.vex;
        const t0 = performance.now();

        const onProgress = (progress: IFileProgress) => {
            setProgress(
                progress.progress < 100
                    ? zeroPad(progress.progress, 2)
                    : zeroPad(99, 2)
            );
            setLoaded(progress.loaded);
            setTotal(progress.total);
            const timeElapsed = (performance.now() - t0) / 1000;
            const speed = progress.loaded / timeElapsed;
            setSpeed(formatBytes(speed));
        };

        client.on("fileProgress", onProgress);

        if (size > 20000000) {
            if (store.get("settings.sounds")) {
                errorFX.play();
            }
            client.off("fileProgress", onProgress);
            setErrText("File is too big (max 20mb)");
            setTimeout(() => {
                setUploading(false);
                setErrText("");
            }, 3000);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const result = event.target?.result;
            if (result) {
                try {
                    const buf = Buffer.from(result as ArrayBuffer);
                    const client = window.vex;
                    const type = await FileType.fromBuffer(buf);
                    const [file, key] = await client.files.create(buf);

                    const fileStr = fileToString(
                        name.replace(":", "-"),
                        file,
                        key,
                        type?.mime || fileDetails.type || "unknown"
                    );
                    if (props.group) {
                        await client.messages.group(props.targetID, fileStr);
                    } else {
                        await client.messages.send(props.targetID, fileStr);
                    }
                    client.off("fileProgress", onProgress);
                    setUploading(false);
                } catch (err) {
                    log.warn(err);
                    setErrText(err.toString());
                    client.off("fileProgress", onProgress);
                    setTimeout(() => {
                        setUploading(false);
                    }, 3000);
                    return;
                }
            }
        };
        reader.readAsArrayBuffer(fileDetails);
    };

    useMemo(() => {
        inputRef.current?.focus();
    }, [userID, serverID, channelID, inputRef]);

    useMemo(() => {
        const matches = openEmojiRegex.exec(inputValue);
        if (matches) {
            setMatches(matches);
            const emoji = emojiIndex
                .search(matches[0].replace(":", ""))
                ?.slice(0, 10);
            if (emoji && emoji.length > 0) {
                setEmoji(emoji);
                if (activeEmoji == -1) {
                    setActiveEmoji(activeEmoji + 1);
                }
                if (activeEmoji > emoji.length - 1) {
                    setActiveEmoji(emoji.length - 1);
                }
            } else {
                setEmoji(undefined);
            }
        } else {
            setEmoji(undefined);
        }

        const closedMatches = closedEmojiRegex.exec(inputValue);
        if (closedMatches) {
            for (const match of closedMatches) {
                const emojiResults = emojiIndex.search(match.replace(/:/g, ""));
                if (
                    emojiResults &&
                    emojiResults.length > 0 &&
                    emojiResults[0].id === match.replace(/:/g, "")
                ) {
                    const emoji = emojiResults[0];
                    console.log(match);
                    selectEmoji(emoji, match);
                }
            }
        }
    }, [inputValue]);

    return (
        <div className={`chat-input-wrapper ${props.className || ""}`}>
            {emoji && (
                <div className="emoji-picker-wrapper">
                    {matches &&
                        emoji.map((emoji, index) => (
                            <div
                                onClick={() => {
                                    selectEmoji(emoji);
                                    inputRef.current?.focus();
                                }}
                                className={`emoji-list-entry ${
                                    activeEmoji == index ? "is-active" : ""
                                }`}
                                key={emoji.colons}
                            >
                                {(emoji as any).native || ":X"}&nbsp;&nbsp;
                                {emoji.colons}
                            </div>
                        ))}
                </div>
            )}
            {uploading && (
                <span className="chat-file-spinner-wrapper has-text-left">
                    {errText == "" && (
                        <span className="columns">
                            <span className="column is-narrow">
                                <Loading
                                    size={30}
                                    animation={"bubbles"}
                                    color={"hsl(0, 0%, 71%)"}
                                    className={"chat-file-spinner"}
                                />
                            </span>
                            <span className="help column is-family-monospace upload-speed-text">
                                {Number(progress) > 0 && progress}% Uploaded:{" "}
                                {formatBytes(loaded)}/{formatBytes(total)} at{" "}
                                {speed}
                                /second
                            </span>
                        </span>
                    )}
                    {errText !== "" && (
                        <div className="l-1ch">
                            <span className="is-family-monospace help has-text-danger">
                                {errText}
                            </span>
                        </div>
                    )}
                </span>
            )}

            <Dropzone
                noClick
                onDrop={(acceptedFiles) => {
                    const fileDetails = acceptedFiles[0];
                    uploadFile(fileDetails);
                }}
            >
                {({ getRootProps, getInputProps, isDragActive }) => (
                    <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <textarea
                            disabled={props.disabled}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ref={inputRef as any}
                            autoFocus={true}
                            onPaste={(event) => {
                                if (
                                    event.clipboardData.items.length > 0 &&
                                    event.clipboardData.items[0].type.includes(
                                        "image"
                                    )
                                ) {
                                    const fileDetails = event.clipboardData.items[0].getAsFile();
                                    if (fileDetails) {
                                        uploadFile(fileDetails);
                                    }
                                }
                            }}
                            value={inputValue}
                            className={`textarea has-fixed-size ${
                                isDragActive ? "is-warning is-focused" : ""
                            }`}
                            onChange={(event) => {
                                setInputValue(event.target.value);
                            }}
                            rows={1}
                            onKeyDown={(event) => {
                                adjustInputHeight(event);

                                if (emoji && emoji.length > 0) {
                                    if (event.key === "Tab") {
                                        event.preventDefault();
                                        const selectedEmoji =
                                            emoji[activeEmoji];
                                        selectEmoji(selectedEmoji);
                                    }
                                    if (event.key === "ArrowDown") {
                                        event.preventDefault();
                                        if (activeEmoji + 1 < emoji.length) {
                                            setActiveEmoji(activeEmoji + 1);
                                        }
                                    }
                                    if (event.key === "ArrowUp") {
                                        event.preventDefault();
                                        if (activeEmoji !== 0) {
                                            setActiveEmoji(activeEmoji - 1);
                                        }
                                    }
                                    return;
                                }
                            }}
                            onKeyUp={async (event) => {
                                adjustInputHeight();

                                if (event.key === "Enter" && !event.shiftKey) {
                                    const messageText = inputValue;
                                    if ((messageText || "").trim() === "") {
                                        return;
                                    }
                                    setInputValue("");
                                    resetInputHeight();
                                    const client = window.vex;
                                    try {
                                        if (props.group) {
                                            await client.messages.group(
                                                props.targetID,
                                                messageText
                                            );
                                        } else {
                                            await client.messages.send(
                                                props.targetID,
                                                messageText
                                            );
                                        }
                                    } catch (err) {
                                        log.error(err);
                                        if (err.message) {
                                            if (props.group) {
                                                dispatch(
                                                    failGroup(err.message)
                                                );
                                            } else {
                                                dispatch(
                                                    failMessage(
                                                        err.message,
                                                        err.error.error
                                                    )
                                                );
                                            }
                                        } else {
                                            log.warn(err);
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                )}
            </Dropzone>
        </div>
    );
}

const fileToString = (name: string, file: IFile, key: string, type: string) => {
    return `{{${name}:${file.fileID}:${key}:${type}}}`;
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const zeroPad = (num: number, places: number) =>
    String(num).padStart(places, "0");
