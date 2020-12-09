import { createSlice } from "@reduxjs/toolkit";
import { IDisplayMessage } from "../Base";
import { AppThunk, RootState } from "../store";
import { format, formatDistance, formatRelative, subMinutes } from "date-fns";

function formatTime(timestamp: Date) {
    formatDistance(timestamp, new Date(Date.now()));
}

export interface ISzDisplayMessage {
    message: string;
    nonce: string;
    timestamp: string;
    sender: string;
}

function serializeMessage(message: IDisplayMessage): ISzDisplayMessage {
    const serialized: ISzDisplayMessage = {
        message: message.message,
        nonce: message.nonce,
        timestamp: message.timestamp.toString(),
        sender: message.sender,
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
            if (!state[action.payload.sender]) {
                state[action.payload.sender] = {};
            }
            state[action.payload.sender][action.payload.nonce] = action.payload;
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
