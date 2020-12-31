import type { RootState, AppThunk } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

type InputState = Record<string, string>;

const initialState: InputState = {
    "keyfile-login-pasword": "",
};

const inputSlice = createSlice({
    name: "inputs",
    initialState,
    reducers: {
        add: (state, action) => {
            const { formID, input } = action.payload;
            state[formID] = input;
            return state;
        },
        reset: () => {
            return initialState;
        },
    },
});

export const { add, reset } = inputSlice.actions;

export const addInputState = (formID: string, input: string): AppThunk => (
    dispatch
) => {
    const details = { formID, input };
    dispatch(add(details));
};

export const resetInputStates = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectInputStates = (state: RootState): Record<string, string> =>
    state.inputs;

export default inputSlice.reducer;
