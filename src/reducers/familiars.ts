import type { RootState, AppThunk } from '~Types';

import { createSlice } from '@reduxjs/toolkit';
import { IUser } from '@vex-chat/libvex';

import { ISerializableUser, deserializeUser, serializeUser } from './user';

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
    name: 'familiars',
    initialState: {},
    reducers: {
        set: (_state, action) => {
            return action.payload;
        },
        add: (state: Record<string, ISerializableUser>, action) => {
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
    dispatch(set(serializeUserList(users)));

export const addFamiliar = (users: IUser): AppThunk => (dispatch) =>
    dispatch(add(serializeUser(users)));

export const resetFamiliars = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectFamiliars = (state: RootState): Record<string, IUser> =>
    deserializeUserList(state.familiars);

export default counterSlice.reducer;
