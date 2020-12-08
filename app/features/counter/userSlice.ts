import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../store";
import log from "electron-log";

const userSlice = createSlice({
    name: "user",
    initialState: {},
    reducers: {
        set: (state, action) => {
            log.info(state);
            log.info(action.payload);
            return action.payload;
        },
    },
});

export const { set } = userSlice.actions;

export const setUser = (user: any): AppThunk => (dispatch) => {
    dispatch(set(user));
};

export default userSlice.reducer;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const selectUser = (state: RootState) => state.user;
