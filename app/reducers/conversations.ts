import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";

const conversationSlice = createSlice({
    name: "conversations",
    initialState: {},
    reducers: {
        set: (_state: Record<string, string[]>, action) => {
            return action.payload;
        },
        add: (state: Record<string, string[]>, action) => {
            state[action.payload.userID] = action.payload;
            return state;
        },
    },
});

export const { set, add } = conversationSlice.actions;

export const addConversation = (
    userID: string,
    fingerprints: string[] = []
): AppThunk => (dispatch) => {
    const payload = { userID, fingerprints };
    dispatch(add(payload));
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
