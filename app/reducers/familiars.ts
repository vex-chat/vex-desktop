import { createSlice } from "@reduxjs/toolkit";
import { IUser } from "@vex-chat/vex-js";
import { AppThunk, RootState } from "../store";
import { ISerializableUser, deserializeUser, serializeUser } from "./user";

function serializeUserList(list: IUser[]): Record<string, ISerializableUser> {
    const serialized: Record<string, ISerializableUser> = {};

    for (const user of list) {
        serialized[user.userID] = serializeUser(user);
    }

    return serialized;
}

function deserializeUserList(
    list: Record<string, ISerializableUser>
): Record<string, IUser> {
    const deserialized: Record<string, IUser> = {};

    for (const user in list) {
        deserialized[user] = deserializeUser(list[user]);
    }

    return deserialized;
}

const counterSlice = createSlice({
    name: "familiars",
    initialState: {},
    reducers: {
        set: (_state, action) => {
            return action.payload;
        },
    },
});

export const { set } = counterSlice.actions;

export const setFamiliars = (users: IUser[]): AppThunk => (dispatch) =>
    dispatch(set(serializeUserList(users)));

export const selectFamiliars = (state: RootState): Record<string, IUser> =>
    deserializeUserList(state.familiars);

export default counterSlice.reducer;
