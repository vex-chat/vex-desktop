/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { IFile, IFileProgress } from "@vex-chat/libvex";
import type { EmojiData } from "emoji-mart";

import { capitalCase } from "change-case";
import log from "electron-log";
import { emojiIndex } from "emoji-mart";
import FileType from "file-type";
import levenshtein from "js-levenshtein";
import React, { useMemo, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import { errorFX } from "../constants/sounds";
import { fail as failGroup } from "../reducers/groupMessages";
import { failMessage } from "../reducers/messages";
import store from "../utils/DataStore";
import { formatBytes } from "../utils/formatBytes";

import Loading from "./Loading";

const openEmojiRegex = /:\w+$/;
const closedEmojiRegex = /:\w+:/g;

export function ChatInput(props: {
    targetID: string;
    userBarOpen: boolean;
    group?: boolean;
    className?: string;
    disabled?: boolean;
    outboxMessages: string[];
    setOutboxMessages: (arr: string[]) => void;
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
            return;
        }
        console.log(emoji);
        // emoji.id is actually the name
        const replaceValue: string =
            (emoji as any).native ||
            `<<${emoji.id}:${(emoji as any).emojiID}>>` ||
            ":X";
        const match = matchOverride || matches[0];
        setInputValue(inputValue.replace(match, `${replaceValue} `));
        setEmoji(undefined);
        setActiveEmoji(-1);
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

    const getEmojiResults = async (emojiSearch: string) => {
        const nativeEmojis = emojiIndex
            .search(emojiSearch.replace(":", ""))
            ?.map((emoji) => {
                const ld = levenshtein(
                    emojiSearch.toLowerCase(),
                    (emoji.id || emoji.name).toLowerCase()
                );
                const length = Math.max(emojiSearch.length, emoji.name.length);
                let similarity = 1 - ld / length;
                if (
                    (
                        emoji.id?.toLowerCase() || emoji.name.toLowerCase()
                    ).includes(emojiSearch.toLowerCase())
                ) {
                    similarity = 1;
                }

                (emoji as any).similarity = similarity;
                return emoji;
            });

        const client = window.vex;

        const customEmojiData = serverID
            ? await client.emoji.retrieveList(serverID)
            : [];

        const customEmojis: EmojiData[] = customEmojiData.map((emojiData) => {
            const ld = levenshtein(
                emojiSearch.toLowerCase(),
                emojiData.name.toLowerCase()
            );
            const length = Math.max(emojiSearch.length, emojiData.name.length);
            let similarity = 1 - ld / length;
            if (
                emojiData.name.toLowerCase().includes(emojiSearch.toLowerCase())
            ) {
                similarity = 1;
            }

            const client = window.vex;

            return {
                id: emojiData.name,
                name: capitalCase(emojiData.name),
                colons: `:${emojiData.name}:`,
                text: "",
                short_names: [emojiData.name],
                emoticons: [],
                custom: true,
                imageUrl: client.getHost() + `/emoji/${emojiData.emojiID}`,
                emojiID: emojiData.emojiID,
                similarity,
            };
        });

        return [...(nativeEmojis || []), ...customEmojis]
            .sort((a, b) => {
                if ((a as any).similarity > (b as any).similarity) {
                    return -1;
                }
                if ((a as any).name < (b as any).name) {
                    return 1;
                }
                return 0;
            })
            .filter((emoji) => {
                return (
                    (emoji.id || emoji.name).includes(emojiSearch) ||
                    (emoji as any).similarity > 0.35
                );
            })
            .slice(0, 20);
    };

    useMemo(() => {
        inputRef.current?.focus();
    }, [userID, serverID, channelID, inputRef]);

    useMemo(async () => {
        const matches = openEmojiRegex.exec(inputValue);
        if (matches) {
            setMatches(matches);
            const emojiSearch = matches[0].replace(":", "");

            const emojiResults = await getEmojiResults(emojiSearch);

            if (emojiResults && emojiResults.length > 0) {
                setEmoji([]);
                setEmoji(emojiResults);
                if (activeEmoji == -1) {
                    setActiveEmoji(activeEmoji + 1);
                }
                if (activeEmoji > emojiResults.length - 1) {
                    setActiveEmoji(emojiResults.length - 1);
                }
            } else {
                setEmoji(undefined);
                setActiveEmoji(-1);
            }
        } else {
            setEmoji(undefined);
            setActiveEmoji(-1);
        }

        const closedMatches = closedEmojiRegex.exec(inputValue);
        if (closedMatches) {
            for (const match of closedMatches) {
                const emojiResults = await getEmojiResults(
                    match.replace(/:/g, "")
                );
                if (
                    emojiResults &&
                    emojiResults.length > 0 &&
                    emojiResults[0].id === match.replace(/:/g, "")
                ) {
                    const emoji = emojiResults[0];
                    selectEmoji(emoji, match);
                }
            }
        }
    }, [inputValue]);

    return (
        <div
            className={`chat-input-wrapper ${props.className || ""} ${
                !props.userBarOpen ? "direct-messaging" : ""
            }`}
        >
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
                                key={(emoji as any).emojiID || emoji.id}
                            >
                                {(emoji as any).native || (
                                        <img
                                            src={(emoji as any).imageUrl}
                                            className="emoji"
                                        />
                                    ) ||
                                    ":X"}
                                &nbsp;&nbsp;
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
                            onKeyDown={async (event) => {
                                adjustInputHeight(event);

                                if (event.key === "Enter" && !event.shiftKey) {
                                    const messageText = inputValue;
                                    if ((messageText || "").trim() === "") {
                                        return;
                                    }

                                    const outbox = [...props.outboxMessages];
                                    outbox.push(messageText);
                                    props.setOutboxMessages(outbox);

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
                            onKeyUp={(event) => {
                                adjustInputHeight(event);
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

const zeroPad = (num: number, places: number) =>
    String(num).padStart(places, "0");
