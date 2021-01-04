import type { IFile, IFileProgress } from "@vex-chat/libvex";

import log from "electron-log";
import fs from "fs";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";

import { fail as failGroup } from "../reducers/groupMessages";
import { addInputState, selectInputStates } from "../reducers/inputs";
import { failMessage } from "../reducers/messages";

import Loading from "./Loading";

export function ChatInput(props: {
    targetID: string;
    group?: boolean;
}): JSX.Element {
    const dispatch = useDispatch();
    const inputValues: Record<string, string> = useSelector(selectInputStates);
    const inputValue: string = inputValues[props.targetID];
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState("00");
    const [loaded, setLoaded] = useState(0);
    const [total, setTotal] = useState(0);
    const [speed, setSpeed] = useState("");

    return (
        <div className="chat-input-wrapper">
            {uploading && (
                <span className="chat-file-spinner-wrapper has-background-light">
                    <Loading
                        size={80}
                        animation={"cubes"}
                        color={"hsl(0, 0%, 71%)"}
                        className={"chat-file-spinner"}
                    />
                    <span className="is-family-monospace">
                        {Number(progress) > 0 && progress}% Uploaded:{" "}
                        {formatBytes(loaded)}/{formatBytes(total)} at {speed}
                        /second
                    </span>
                </span>
            )}

            <Dropzone
                noClick
                onDrop={(acceptedFiles) => {
                    const fileDetails = acceptedFiles[0];
                    const { name, type } = fileDetails;

                    fs.readFile(
                        fileDetails.path,
                        async (
                            err: NodeJS.ErrnoException | null,
                            buf: Buffer
                        ) => {
                            if (err) {
                                log.warn(err);
                                return;
                            }
                            const client = window.vex;

                            const t0 = performance.now();
                            setUploading(true);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            client.on(
                                "fileProgress",
                                (progress: IFileProgress) => {
                                    setProgress(
                                        progress.progress < 100
                                            ? zeroPad(progress.progress, 2)
                                            : zeroPad(99, 2)
                                    );
                                    setLoaded(progress.loaded);
                                    setTotal(progress.total);
                                    const timeElapsed =
                                        t0 - performance.now() / 1000;
                                    const speed = progress.loaded / timeElapsed;
                                    console.log(timeElapsed, speed);
                                    setSpeed(formatBytes(speed));
                                }
                            );

                            const [file, key] = await client.files.create(buf);

                            setUploading(false);
                            setProgress("00");

                            const fileStr = fileToString(name, file, key, type);
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
                        }
                    );
                }}
            >
                {({ getRootProps, getInputProps, isDragActive }) => (
                    <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <textarea
                            value={inputValue}
                            className={`textarea has-fixed-size ${
                                isDragActive ? "is-warning is-focused" : ""
                            }`}
                            onChange={(event) => {
                                dispatch(
                                    addInputState(
                                        props.targetID,
                                        event.target.value
                                    )
                                );
                            }}
                            onKeyDown={async (event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    dispatch(addInputState(props.targetID, ""));

                                    const messageText = inputValue;
                                    if (messageText.trim() === "") {
                                        return;
                                    }
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
