import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { IUser } from "@vex-chat/vex";

export interface ISerializableUser {
    userID: string;
    username: string;
    signKey: string;
    lastSeen: string;
}

export function deserializeUser(user: ISerializableUser): IUser {
    return {
        userID: user.userID,
        username: user.username,
        signKey: user.signKey,
        lastSeen: new Date(user.lastSeen),
    };
}

export function serializeUser(user: IUser): ISerializableUser {
    return {
        userID: user.userID,
        username: user.username,
        signKey: user.signKey,
        lastSeen: user.lastSeen.toString(),
    };
}

const emptyUser: ISerializableUser = {
    userID: "",
    username: "",
    signKey: "",
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
