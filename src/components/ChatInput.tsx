import type { IFile } from "@vex-chat/libvex";

import fs from "fs";
import Dropzone from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";

import { fail as failGroup } from "../reducers/groupMessages";
import { addInputState, selectInputStates } from "../reducers/inputs";
import { failMessage } from "../reducers/messages";

export function ChatInput(props: {
    targetID: string;
    group?: boolean;
}): JSX.Element {
    const dispatch = useDispatch();
    const inputValues: Record<string, string> = useSelector(selectInputStates);
    const inputValue: string = inputValues[props.targetID];

    return (
        <div className="chat-input-wrapper">
            <Dropzone
                noClick
                onDrop={(acceptedFiles) => {
                    const fileDetails = acceptedFiles[0];
                    const { name, type } = fileDetails;

                    console.log(fileDetails);
                    fs.readFile(
                        fileDetails.path,
                        async (
                            err: NodeJS.ErrnoException | null,
                            buf: Buffer
                        ) => {
                            if (err) {
                                console.warn(err);
                                return;
                            }
                            const client = window.vex;

                            console.log(Buffer.byteLength(buf));

                            const [file, key] = await client.files.create(buf);
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
                                        console.log(err);
                                        if (err.message) {
                                            console.log(err);
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
                                            console.warn(err);
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
