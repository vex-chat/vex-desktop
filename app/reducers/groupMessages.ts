import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IMessage } from "@vex-chat/libvex";
import { AppThunk, RootState } from "../store";
import { ISerializedMessage, serializeMessage } from "./messages";

const initialState: {
    [groupId: string]: {
        [mailID: string]: ISerializedMessage
    }
} = {};

const groupMessageSlice = createSlice({
    name: "groupMessages",
    initialState,
    reducers: {
        reset: () => initialState,
        add: (state, {payload}: PayloadAction<ISerializedMessage>) => {
            const  { group, mailID } = payload;

            //TODO: reducers are pure. should filter bad messages before reducer
            if (!group) throw new Error("Message must contain a group, or use messages.add()");

            if (!state[group]) {
                state[group] = {};
            }

            if (!state[group][mailID]) {
                state[group][mailID] = payload;
            }

            return state;
        },
        fail: (state, action) => {
            const {
                message,
                errorString,
            }: {
                message: ISerializedMessage;
                errorString: string;
            } = action.payload;

            const group = action.payload.message.group;

            if (
                state[group] === undefined ||
                state[group][message.mailID] === undefined
            ) {
                // it doesn't exist, we are done
                return state;
            }

            const failedMessage = state[group][message.mailID];

            // mark it failed
            failedMessage.failed = true;
            failedMessage.failMessage = errorString;
            state[group][message.mailID] = failedMessage;

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
