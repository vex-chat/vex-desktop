import { createSlice } from "@reduxjs/toolkit";
import { IConversation } from "@vex-chat/vex-js";
import { AppThunk, RootState } from "../store";

const conversationSlice = createSlice({
    name: "conversations",
    initialState: {},
    reducers: {
        set: (_state: Record<string, string[]>, action) => {
            return action.payload;
        },
        add: (state: Record<string, string[]>, action) => {
            const payload: Partial<IConversation> = action.payload;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (state[payload.userID!] === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                state[payload.userID!] = [];
            } else {
                if (payload.fingerprint !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    state[payload.userID!] = [
                        ...state[payload.userID!],
                        payload.fingerprint,
                    ];
                }
            }

            return state;
        },
    },
});

export const { set, add } = conversationSlice.actions;

export const addConversation = (
    conversation: Partial<IConversation>
): AppThunk => (dispatch) => {
    dispatch(add(conversation));
};

export const setConversations = (state: Record<string, string[]>): AppThunk => (
    dispatch
) => {
    dispatch(set(state));
};

export const selectConversations = (
    state: RootState
): Record<string, string[]> => state.conversations;

export default conversationSlice.reducer;
