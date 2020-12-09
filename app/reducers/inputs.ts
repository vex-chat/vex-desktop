import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";

const inputSlice = createSlice({
    name: "inputs",
    initialState: {},
    reducers: {
        set: (_state, action) => {
            return action.payload;
        },
    },
});

export const { set } = inputSlice.actions;

export const setInputState = (userID: string, input: string): AppThunk => (
    dispatch
) => {
    const obj: Record<string, string> = {};
    obj[userID] = input;
    dispatch(set(obj));
};

export const selectInputs = (state: RootState): Record<string, string> =>
    state.inputs;

export default inputSlice.reducer;
