/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AppThunk, RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

import { getThemeColors } from "../utils";

const initialState: Record<string, any> = {
    initialLoad: true,
    failCount: 0,
    serverMenuOpen: false,
    themeColors: getThemeColors(),
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        reset: () => {
            return initialState;
        },
        set: (state: Record<string, any>, action) => {
            const { key, value } = action.payload;
            state[key] = value;
            return state;
        },
        fail: (state) => {
            state.failCount = (state.failCount as number) + 1;
            return state;
        },
    },
});

export const { set, reset, fail } = appSlice.actions;

export const setApp = (key: string, value: any): AppThunk => (dispatch) => {
    const payload = { key, value };
    dispatch(set(payload));
};

export const failApp = (): AppThunk => (dispatch) => {
    dispatch(fail());
};

export const resetApp = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectApp = (state: RootState): Record<string, any> => state.app;

export default appSlice.reducer;
