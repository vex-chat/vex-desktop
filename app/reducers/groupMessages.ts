import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { IGroupSerializedMessage } from "./messages";

type FailPayload = {message: IGroupSerializedMessage, errorString: string};

const initialState: {
    [groupId: string]: {
        [mailID: string]: IGroupSerializedMessage
    }
} = {};

const groupMessageSlice = createSlice({
    name: "groupMessages",
    initialState,
    reducers: {
        reset: () => initialState,
        add: (state, {payload}: PayloadAction<IGroupSerializedMessage>) => {
            const  { group, mailID } = payload;

            if (!state[group]) {
                state[group] = {};
            }

            if (!state[group][mailID]) {
                state[group][mailID] = payload;
            }

            return state;
        },
        fail: (state, { payload: { message, errorString }}: PayloadAction<FailPayload>) => {
            const { group, mailID }= message

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

export const { add, reset, fail } = groupMessageSlice.actions;

export const makeGroupMessageSelector: (groupId: string) => (state: RootState) => Record<string, IGroupSerializedMessage> = (
    groupId
) => ({groupMessages}) => groupMessages[groupId];

export default groupMessageSlice.reducer;
