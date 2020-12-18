import { createSlice } from "@reduxjs/toolkit";
import { IMessage } from "@vex-chat/vex-js";
import { AppThunk, RootState } from "../store";
import { ISerializedMessage, serializeMessage } from "./messages";

const groupMessageSlice = createSlice({
    name: "groupMessages",
    initialState: {},
    reducers: {
        reset: () => {
            return {};
        },
        add: (
            state: Record<string, Record<string, ISerializedMessage>>,
            action
        ) => {
            const message = action.payload;
            const group = message.group;
            if (!group) {
                throw new Error(
                    "Message must contain a group, or use messages.add()"
                );
            }
            if (!state[group]) {
                state[group] = {};
            }
            if (!state[group][message.mailID]) {
                state[group][message.mailID] = message;
            }
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
                action.payload.message.direction === "outgoing"
                    ? action.payload.message.recipient
                    : action.payload.message.sender;

            if (
                state[thread] === undefined ||
                !state[thread][message.mailID] === undefined
            ) {
                // it doesn't exist, we are done
                return state;
            }

            const failedMessage = state[thread][message.mailID];

            // mark it failed
            failedMessage.failed = true;
            failedMessage.failMessage = errorString;

            console.log(failedMessage);
            state[thread][message.mailID] = failedMessage;

            return state;
        },
    },
});

export const { add, reset, fail } = groupMessageSlice.actions;

export const resetGroupMessages = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const failGroupMessage = (
    message: IMessage,
    errorString: string
): AppThunk => (dispatch) => {
    const szMsg = serializeMessage(message);
    const payload = { message: szMsg, errorString };
    dispatch(fail(payload));
};

export const addGroupMessage = (message: IMessage): AppThunk => (dispatch) => {
    const szMsg = serializeMessage(message);
    dispatch(add(szMsg));
};

export const selectGroupMessages = (
    state: RootState
): Record<string, Record<string, ISerializedMessage>> => state.groupMessages;

export default groupMessageSlice.reducer;
