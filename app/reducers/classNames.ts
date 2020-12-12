import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";

const classSlice = createSlice({
    name: "classNames",
    initialState: {},
    reducers: {
        add: (state: Record<string, string>, action) => {
            const { key, value } = action.payload;
            state[key] = value;
            return state;
        },
        reset: () => {
            return {};
        },
    },
});

export const { add, reset } = classSlice.actions;

export const addClassName = (key: string, value: string): AppThunk => (
    dispatch
) => {
    const payload = { key, value };
    dispatch(add(payload));
};

export const resetClassNames = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectClassNames = (state: RootState): Record<string, string> =>
    state.classNames;

export default classSlice.reducer;
