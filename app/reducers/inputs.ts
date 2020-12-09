import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";

const inputSlice = createSlice({
    name: "inputs",
    initialState: {},
    reducers: {
        add: (state: Record<string, string>, action) => {
            const userID = action.payload.userID;
            const input = action.payload.input;
            state[userID] = input;
            return state;
        },
    },
});

export const { add } = inputSlice.actions;

export const setInputState = (userID: string, input: string): AppThunk => (
    dispatch
) => {
    const details = { userID, input };
    dispatch(add(details));
};

export const selectInputs = (state: RootState): Record<string, string> =>
    state.inputs;

export default inputSlice.reducer;
