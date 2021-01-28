import type { IUser } from "@vex-chat/libvex";
import type { AppThunk, RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

const emptyUser: IUser = {
    userID: "",
    username: "",
    // TODO: fix this shit, whatever is going on here
    lastSeen: (new Date(Date.now()).toString() as unknown) as number,
};

const userSlice = createSlice({
    name: "user",
    initialState: emptyUser,
    reducers: {
        reset: () => {
            return emptyUser;
        },
        set: (_state, action) => {
            return action.payload;
        },
    },
});

export const { set, reset } = userSlice.actions;

export const setUser = (user: IUser): AppThunk => (dispatch) => {
    dispatch(set(user));
};

export const resetUser = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectUser = (state: RootState): IUser => state.user;

export default userSlice.reducer;
