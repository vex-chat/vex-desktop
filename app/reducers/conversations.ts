import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";

const conversationSlice = createSlice({
    name: "fingerprints",
    initialState: {},
    reducers: {
        set: (_state: Record<string, string[]>, action) => {
            return action.payload;
        },
    },
});

export const { set } = conversationSlice.actions;

export const setConversations = (state: Record<string, string[]>): AppThunk => (
    dispatch
) => {
    dispatch(set(state));
};

export const selectConversations = (
    state: RootState
): Record<string, string[]> => state.conversations;

export default conversationSlice.reducer;
