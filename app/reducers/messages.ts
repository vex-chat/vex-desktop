import { createSlice } from "@reduxjs/toolkit";
import { IDisplayMessage } from "../Base";
import { AppThunk, RootState } from "../store";

export interface ISzDisplayMessage {
    message: string;
    nonce: string;
    timestamp: string;
    sender: string;
    recipient: string;
    direction: "incoming" | "outgoing";
}

function serializeMessage(message: IDisplayMessage): ISzDisplayMessage {
    const serialized: ISzDisplayMessage = {
        message: message.message,
        nonce: message.nonce,
        timestamp: message.timestamp.toString(),
        sender: message.sender,
        recipient: message.recipient,
        direction: message.direction,
    };
    return serialized;
}

const messageSlice = createSlice({
    name: "messages",
    initialState: {},
    reducers: {
        add: (
            state: Record<string, Record<string, ISzDisplayMessage>>,
            action
        ) => {
            const thread =
                action.payload.direction === "outgoing"
                    ? action.payload.recipient
                    : action.payload.sender;
            const message = action.payload;

            if (!state[thread]) {
                state[thread] = {};
            }

            if (!state[thread][message.nonce]) {
                state[thread][message.nonce] = message;
            }

            return state;
        },
    },
});

export const { add } = messageSlice.actions;

export const setMessages = (message: IDisplayMessage): AppThunk => (
    dispatch
) => {
    const szMsg = serializeMessage(message);
    dispatch(add(szMsg));
};

export const selectMessages = (
    state: RootState
): Record<string, Record<string, ISzDisplayMessage>> => state.messages;

export default messageSlice.reducer;
