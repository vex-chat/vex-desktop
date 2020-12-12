import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";

const initialState: Record<string, boolean | string> = { initialLoad: true };

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        reset: () => {
            return initialState;
        },
        set: (state: Record<string, boolean | string>, action) => {
            const { key, value } = action.payload;
            state[key] = value;
            return state;
        },
    },
});

export const { set, reset } = appSlice.actions;

export const setApp = (key: string, value: boolean | string): AppThunk => (
    dispatch
) => {
    const payload = { key, value };
    dispatch(set(payload));
};

export const resetApp = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectApp = (state: RootState): Record<string, boolean | string> =>
    state.app;

export default appSlice.reducer;
