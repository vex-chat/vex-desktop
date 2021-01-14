import type { RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

const initialState = Date.now();

const avatarHashSlice = createSlice({
    name: "avatarHash",
    initialState,
    reducers: {
        set: () => {
            return Date.now();
        },
    },
});

export const { set } = avatarHashSlice.actions;

export const selectAvatarHash = (state: RootState): number => state.avatarHash;

export default avatarHashSlice.reducer;
