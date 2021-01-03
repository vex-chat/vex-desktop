import type { IFile, IUser } from "@vex-chat/libvex";

import fs from "fs";
import Dropzone from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { selectFamiliars } from "../reducers/familiars";
import { addInputState, selectInputStates } from "../reducers/inputs";
import { failMessage } from "../reducers/messages";

export function ChatInput(): JSX.Element {
    const params: { userID: string } = useParams();
    const familiars = useSelector(selectFamiliars);
    const dispatch = useDispatch();
    const inputValues: Record<string, string> = useSelector(selectInputStates);
    const familiar: IUser | undefined = familiars[params.userID];
    const inputValue: string = inputValues[params.userID] || "";

    return (
        <div className="chat-input-wrapper">
            <Dropzone
                noClick
                onDrop={(acceptedFiles) => {
                    const fileDetails = acceptedFiles[0];

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
                            const [file, key] = await client.files.create(buf);
                            await client.messages.send(
                                familiar.userID,
                                fileToString(file, key)
                            );
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
                                        params.userID,
                                        event.target.value
                                    )
                                );
                            }}
                            onKeyDown={async (event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();

                                    const messageText = inputValue;
                                    dispatch(addInputState(params.userID, ""));
                                    if (messageText.trim() === "") {
                                        return;
                                    }

                                    const client = window.vex;
                                    try {
                                        await client.messages.send(
                                            familiar.userID,
                                            messageText
                                        );
                                    } catch (err) {
                                        console.log(err);
                                        if (err.message) {
                                            console.log(err);
                                            dispatch(
                                                failMessage(
                                                    err.message,
                                                    err.error.error
                                                )
                                            );
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

const fileToString = (file: IFile, key: string) => {
    return `{{file:${file.fileID}:${key}}}`;
};
