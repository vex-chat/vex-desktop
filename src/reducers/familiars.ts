import type { IUser } from "@vex-chat/libvex";
import type { AppThunk, RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
    name: "familiars",
    initialState: {},
    reducers: {
        set: (_state, action) => {
            return action.payload;
        },
        add: (state: Record<string, IUser>, action) => {
            state[action.payload.userID] = action.payload;
            return state;
        },
        reset: () => {
            return {};
        },
    },
});

export const { set, add, reset } = counterSlice.actions;

export const setFamiliars = (users: IUser[]): AppThunk => (dispatch) =>
    dispatch(set(objifyUsers(users)));

export const addFamiliar = (user: IUser): AppThunk => (dispatch) =>
    dispatch(add(user));

export const resetFamiliars = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectFamiliars = (state: RootState): Record<string, IUser> =>
    state.familiars;

export default counterSlice.reducer;

const objifyUsers = (users: IUser[]) => {
    const records: Record<string, IUser> = {};
    for (const user of users) {
        records[user.userID] = user;
    }
    return records;
};
