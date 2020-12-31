import type { RootState, AppThunk } from '~Types';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IChannel } from '@vex-chat/libvex';

const initialState: Record<string, Record<string, IChannel>> = {};

const channelSlice = createSlice({
    name: 'channels',
    initialState,
    reducers: {
        add: (state, action: PayloadAction<IChannel>) => {
            const { channelID, serverID } = action.payload;
            if (state[serverID] === undefined) {
                state[serverID] = {};
            }
            state[serverID][channelID] = action.payload;
            return state;
        },
        del: (state, action: PayloadAction<IChannel>) => {
            const { serverID, channelID } = action.payload;
            delete state[serverID][channelID];
            return state;
        },
        reset: () => {
            return initialState;
        },
    },
});

export const { reset, del, add } = channelSlice.actions;

export const resetChannels = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const addChannels = (channels: IChannel[]): AppThunk => (dispatch) => {
    for (const channel of channels) {
        dispatch(add(channel));
    }
};

export const deleteChannel = (channel: IChannel): AppThunk => (dispatch) => {
    dispatch(del(channel));
};

export const selectChannels: (
    serverID: string
) => (state: RootState) => Record<string, IChannel> = (serverID) => ({
    channels,
}) => channels[serverID] || {};

export default channelSlice.reducer;
