import type { AppThunk, RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

const initialState: Record<string, boolean | string | number> = {
    initialLoad: true,
    failCount: 0,
    serverMenuOpen: false,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        reset: () => {
            return initialState;
        },
        set: (state: Record<string, boolean | string | number>, action) => {
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

export const setApp = (
    key: string,
    value: boolean | string | number
): AppThunk => (dispatch) => {
    const payload = { key, value };
    dispatch(set(payload));
};

export const failApp = (): AppThunk => (dispatch) => {
    dispatch(fail());
};

export const resetApp = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectApp = (
    state: RootState
): Record<string, boolean | string | number> => state.app;

export default appSlice.reducer;
