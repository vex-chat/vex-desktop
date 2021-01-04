import type { PayloadAction } from "@reduxjs/toolkit";
import type { IMessage } from "@vex-chat/libvex";
import type { AppThunk, RootState } from "~Types";
import type { IGroupSerializedMessage } from "./messages";

import { createSlice } from "@reduxjs/toolkit";

import { serializeMessage } from "./messages";

type FailPayload = { message: IGroupSerializedMessage; errorString: string };
type AddManyPayload = { messages: IGroupSerializedMessage[]; group: string };

const initialState: {
    [groupId: string]: {
        [mailID: string]: IGroupSerializedMessage;
    };
} = {};

const groupMessageSlice = createSlice({
    name: "groupMessages",
    initialState,
    reducers: {
        reset: () => initialState,
        add: (state, { payload }: PayloadAction<IGroupSerializedMessage>) => {
            const { group, mailID } = payload;

            if (!state[group]) {
                state[group] = {};
            }

            if (!state[group][mailID]) {
                state[group][mailID] = payload;
            }

            return state;
        },
        addMany: (
            state,
            { payload: { group, messages } }: PayloadAction<AddManyPayload>
        ) => {
            if (!state[group]) {
                state[group] = {};
            }

            messages.forEach((msg) => {
                if (!state[group][msg.mailID]) {
                    state[group][msg.mailID] = msg;
                }
            });

            return state;
        },
        fail: (
            state,
            { payload: { message, errorString } }: PayloadAction<FailPayload>
        ) => {
            const { group, mailID } = message;

            if (
                state[group] === undefined ||
                state[group][mailID] === undefined
            ) {
                // it doesn't exist, we are done
                return state;
            }

            const failedMessage = state[group][mailID];

            // mark it failed
            failedMessage.failed = true;
            failedMessage.failMessage = errorString;
            state[group][mailID] = failedMessage;

            return state;
        },
    },
});

export const failGroupMessage = (
    message: IMessage,
    errorString: string
): AppThunk => (dispatch) => {
    const szMsg: IGroupSerializedMessage = serializeMessage(
        message
    ) as IGroupSerializedMessage;
    const payload: FailPayload = { message: szMsg, errorString };
    dispatch(fail(payload));
};

export const { add, reset, fail, addMany } = groupMessageSlice.actions;

export const selectGroup: (
    groupId: string
) => (state: RootState) => Record<string, IGroupSerializedMessage> = (
    groupId
) => ({ groupMessages }) => groupMessages[groupId];

export default groupMessageSlice.reducer;
