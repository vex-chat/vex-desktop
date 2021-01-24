import type { IUser } from "@vex-chat/libvex";
import type { AppThunk, RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

export interface ISerializableUser {
    userID: string;
    username: string;
    lastSeen: string;
}

//TODO: update this function to return return the updated IUser from Lib
export function deserializeUser(user: ISerializableUser): IUser {
    return {
        userID: user.userID,
        username: user.username,
        lastSeen: new Date(user.lastSeen).toString(),
    };
}

export function serializeUser(user: IUser): ISerializableUser {
    return {
        userID: user.userID,
        username: user.username,
        lastSeen: user.lastSeen.toString(),
    };
}

const emptyUser: ISerializableUser = {
    userID: "",
    username: "",
    lastSeen: new Date(Date.now()).toString(),
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
    dispatch(set(serializeUser(user)));
};

export const resetUser = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectUser = (state: RootState): IUser =>
    deserializeUser(state.user);

export default userSlice.reducer;
