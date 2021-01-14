import type { IFile, IFileProgress } from "@vex-chat/libvex";

import log from "electron-log";
import FileType from "file-type";
import fs from "fs";
import React, { useMemo, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import { errorFX } from "../constants/sounds";
import { fail as failGroup } from "../reducers/groupMessages";
import { failMessage } from "../reducers/messages";
import store from "../utils/DataStore";

import Loading from "./Loading";

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

    useMemo(() => {
        inputRef.current?.focus();
    }, [userID, serverID, channelID, inputRef]);

    return (
        <div className={`chat-input-wrapper ${props.className || ""}`}>
            {uploading && (
                <span className="chat-file-spinner-wrapper">
                    {errText == "" && (
                        <span className="is-family-monospace help">
                            <Loading
                                size={80}
                                animation={"bubbles"}
                                color={"hsl(0, 0%, 71%)"}
                                className={"chat-file-spinner"}
                            />
                            {Number(progress) > 0 && progress}% Uploaded:{" "}
                            {formatBytes(loaded)}/{formatBytes(total)} at{" "}
                            {speed}
                            /second
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
                    setUploading(true);
                    const fileDetails = acceptedFiles[0];
                    const { name, size } = fileDetails;

                    if (size > 20000000) {
                        if (store.get("settings.sounds")) {
                            errorFX.play();
                        }
                        setErrText("File is too big (max 20mb)");
                        setTimeout(() => {
                            setUploading(false);
                            setErrText("");
                        }, 3000);
                        return;
                    }

                    console.log(fileDetails.size);

                    console.log(fileDetails);

                    fs.readFile(
                        fileDetails.path,
                        async (
                            err: NodeJS.ErrnoException | null,
                            buf: Buffer
                        ) => {
                            if (err) {
                                log.warn(err);
                                setErrText(err.toString());
                                setTimeout(() => {
                                    setUploading(false);
                                    setErrText("");
                                }, 3000);
                                return;
                            }

                            const details = await FileType.fromBuffer(buf);
                            const type = details?.mime;

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
                                const timeElapsed =
                                    (performance.now() - t0) / 1000;
                                const speed = progress.loaded / timeElapsed;
                                setSpeed(formatBytes(speed));
                            };

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            client.on("fileProgress", onProgress);

                            try {
                                const [file, key] = await client.files.create(
                                    buf
                                );
                                setUploading(false);
                                setProgress("00");
                                client.off("fileProgress", onProgress);

                                const fileStr = fileToString(
                                    name.replace(":", "-"),
                                    file,
                                    key,
                                    type || fileDetails.type || "unknown"
                                );
                                console.log(fileStr);
                                if (props.group) {
                                    await client.messages.group(
                                        props.targetID,
                                        fileStr
                                    );
                                } else {
                                    await client.messages.send(
                                        props.targetID,
                                        fileStr
                                    );
                                }
                            } catch (err) {
                                log.warn(err);
                                setErrText(err.toString());
                                setTimeout(() => {
                                    setUploading(false);
                                }, 3000);
                                return;
                            }
                        }
                    );
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
                            value={inputValue}
                            className={`textarea has-fixed-size ${
                                isDragActive ? "is-warning is-focused" : ""
                            }`}
                            onChange={(event) => {
                                setInputValue(event.target.value);
                            }}
                            onKeyDown={async (event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();

                                    const messageText = inputValue;
                                    if ((messageText || "").trim() === "") {
                                        return;
                                    }
                                    setInputValue("");

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
