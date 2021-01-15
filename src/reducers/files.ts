import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

const initialState: Record<string, string> = {};

const fileSlice = createSlice({
    name: "files",
    initialState,
    reducers: {
        reset: () => {
            return initialState;
        },
        set: (
            state,
            action: PayloadAction<{ fileID: string; data: string }>
        ) => {
            const { fileID, data } = action.payload;

            state[fileID] = data;
            return state;
        },
    },
});

export const { reset, set } = fileSlice.actions;

export default fileSlice.reducer;

export const getFiles: () => (
    state: RootState
) => Record<string, string> = () => ({ files }) => files;
