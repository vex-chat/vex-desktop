import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";

const inputSlice = createSlice({
    name: "inputs",
    initialState: {},
    reducers: {
        add: (state: Record<string, string>, action) => {
            const { formID, input } = action.payload;
            state[formID] = input;
            return state;
        },
        reset: () => {
            return {};
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
