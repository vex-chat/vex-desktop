import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { IUser } from "@vex-chat/vex-js";

const emptyUser = {
    userID: "",
    username: "",
    signKey: "",
    lastSeen: new Date(Date.now()),
};

const userSlice = createSlice({
    name: "user",
    initialState: emptyUser,
    reducers: {
        set: (state, action) => {
            return action.payload;
        },
    },
});

export const { set } = userSlice.actions;

export const setUser = (user: IUser): AppThunk => (dispatch) => {
    dispatch(set(user));
};

export default userSlice.reducer;

export const selectUser = (state: RootState): IUser => state.user;
