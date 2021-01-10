import type { IUser } from "@vex-chat/libvex";
import type { RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

const initialState: Record<string, IUser[]> = {};

const onlineListSlice = createSlice({
    name: "onlineLists",
    initialState,
    reducers: {
        set: (state: Record<string, IUser[]>, action) => {
            const {
                channelID,
                userList,
            }: { channelID: string; userList: IUser[] } = action.payload;
            state[channelID] = userList;
            return state;
        },
        reset: () => {
            return initialState;
        },
    },
});

export const { set, reset } = onlineListSlice.actions;

export default onlineListSlice.reducer;

export const selectOnlineList: (
    channelID: string
) => (state: RootState) => IUser[] = (channelID) => ({ onlineLists }) =>
    onlineLists[channelID] || [];
