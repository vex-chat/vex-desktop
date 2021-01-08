import type { PayloadAction } from "@reduxjs/toolkit";
import type { IMessage } from "@vex-chat/libvex";
import type { AppThunk, RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

type AddManyPayload = { messages: ISerializedMessage[]; userID: string };

export interface IBaseSerializedMessage {
    mailID: string;
    message: string;
    nonce: string;
    timestamp: string;
    sender: string;
    recipient: string;
    direction: "incoming" | "outgoing";
    decrypted: boolean;
    failed: boolean;
    failMessage: string;
    authorID: string;
    readerID: string;
}

export interface IGroupSerializedMessage extends IBaseSerializedMessage {
    group: string;
}

export interface INonGroupSerializedMessage extends IBaseSerializedMessage {
    group: null;
}

export type ISerializedMessage =
    | IGroupSerializedMessage
    | INonGroupSerializedMessage;

export function serializeMessage(message: IMessage): ISerializedMessage {
    const serialized: ISerializedMessage = {
        mailID: message.mailID,
        decrypted: message.decrypted,
        message: message.message,
        nonce: message.nonce,
        timestamp: message.timestamp.toString(),
        sender: message.sender,
        recipient: message.recipient,
        direction: message.direction,
        group: message.group,
        failed: false,
        failMessage: "",
        authorID: message.authorID,
        readerID: message.readerID,
    };
    return serialized;
}

const messageSlice = createSlice({
    name: "messages",
    initialState: {},
    reducers: {
        reset: () => {
            return {};
        },
        add: (
            state: Record<string, Record<string, ISerializedMessage>>,
            action
        ) => {
            const thread =
                action.payload.direction === "incoming"
                    ? action.payload.authorID
                    : action.payload.readerID;
            const message = action.payload;

            if (!state[thread]) {
                state[thread] = {};
            }

            if (!state[thread][message.mailID]) {
                state[thread][message.mailID] = message;
            }

            return state;
        },
        addMany: (
            state: Record<string, Record<string, ISerializedMessage>>,
            { payload: { userID, messages } }: PayloadAction<AddManyPayload>
        ) => {
            if (!state[userID]) {
                state[userID] = {};
            }

            messages.forEach((msg) => {
                if (!state[userID][msg.mailID]) {
                    state[userID][msg.mailID] = msg;
                }
            });

            return state;
        },
        fail: (
            state: Record<string, Record<string, ISerializedMessage>>,
            action
        ) => {
            const {
                message,
                errorString,
            }: {
                message: ISerializedMessage;
                errorString: string;
            } = action.payload;

            const thread =
                action.payload.direction === "incoming"
                    ? action.payload.authorID
                    : action.payload.readerID;

            if (
                state[thread] === undefined ||
                state[thread][message.mailID] === undefined
            ) {
                // it doesn't exist, we are done
                return state;
            }

            const failedMessage = state[thread][message.mailID];

            // mark it failed
            failedMessage.failed = true;
            failedMessage.failMessage = errorString;
            state[thread][message.mailID] = failedMessage;

            return state;
        },
    },
});

export const { add, reset, fail, addMany } = messageSlice.actions;

export const resetMessages = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const addMessage = (message: IMessage): AppThunk => (dispatch) => {
    const szMsg = serializeMessage(message);
    dispatch(add(szMsg));
};

export const failMessage = (
    message: IMessage,
    errorString: string
): AppThunk => (dispatch) => {
    const szMsg = serializeMessage(message);
    const payload = { message: szMsg, errorString };
    dispatch(fail(payload));
};

export const selectMessages = (
    state: RootState
): Record<string, Record<string, ISerializedMessage>> => state.messages;

export default messageSlice.reducer;
