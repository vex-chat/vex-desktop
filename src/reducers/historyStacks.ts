import type { RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

const initialState: Record<string, string[]> = {};

const serverHistorySlice = createSlice({
    name: "historyStacks",
    initialState,
    reducers: {
        reset: () => {
            return initialState;
        },
        push: (state, action) => {
            const { serverID, path } = action.payload;
            if (!state[serverID]) {
                state[serverID] = [];
            }
            if (state[serverID][0] === path) {
                console.warn("Not adding duplicate to history stack.");
                return state;
            }
            state[serverID].unshift(path);
            if (state[serverID].length > 10) {
                state[serverID].pop();
            }
            return state;
        },
    },
});

export const { reset, push } = serverHistorySlice.actions;

export default serverHistorySlice.reducer;

export const getHistory: (
    serverID: string
) => (state: RootState) => string[] = (serverID) => ({ historyStacks }) =>
    historyStacks[serverID] || [];

export const getHistoryHead: (
    serverID: string
) => (state: RootState) => string | null = (serverID) => ({
    historyStacks,
}) => {
    if (historyStacks[serverID] && historyStacks[serverID][0]) {
        return historyStacks[serverID][0];
    }
    return null;
};
