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
            if (!state[group][message.nonce]) {
                state[group][message.nonce] = message;
            }
            return state;
        },
    },
});

export const { add, reset } = groupMessageSlice.actions;

export const resetGroupMessages = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const addGroupMessage = (message: IMessage): AppThunk => (dispatch) => {
    const szMsg = serializeMessage(message);
    dispatch(add(szMsg));
};

export const selectGroupMessages = (
    state: RootState
): Record<string, Record<string, ISerializedMessage>> => state.groupMessages;

export default groupMessageSlice.reducer;
