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
        reset: () => {
            return {};
        },
    },
});

export const { add, reset } = inputSlice.actions;

export const addInputState = (userID: string, input: string): AppThunk => (
    dispatch
) => {
    const details = { userID, input };
    dispatch(add(details));
};

export const resetInputStates = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectInputStates = (state: RootState): Record<string, string> =>
    state.inputs;

export default inputSlice.reducer;
