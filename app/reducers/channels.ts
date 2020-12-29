import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { IChannel } from "@vex-chat/libvex";

const initialState: Record<string, Record<string, IChannel>> = {};

const channelSlice = createSlice({
    name: "channels",
    initialState,
    reducers: {
        add: (state, action) => {
            const { channelID, serverID } = action.payload;
            if (state[serverID] === undefined) {
                state[serverID] = {};
            }
            state[serverID][channelID] = action.payload;
            return state;
        },
        reset: () => {
            return initialState;
        },
    },
});

export const { reset, add } = channelSlice.actions;

export const resetChannels = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const addChannels = (channels: IChannel[]): AppThunk => (dispatch) => {
    for (const channel of channels) {
        dispatch(add(channel));
    }
};

export const makeServerChannelsSelector: (
    serverID: string
) => (state: RootState) => Record<string, IChannel> = (serverID) => ({
    channels,
}) => channels[serverID] || {};

export default channelSlice.reducer;
