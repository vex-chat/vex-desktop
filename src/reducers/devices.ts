import type { PayloadAction } from "@reduxjs/toolkit";
import type { IDevice } from "@vex-chat/libvex";
import type { AppThunk, RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

const initialState: Record<string, Record<string, IDevice>> = {};

const channelSlice = createSlice({
    name: "devices",
    initialState,
    reducers: {
        add: (state, action: PayloadAction<IDevice>) => {
            const device: IDevice = action.payload;
            if (state[device.owner] === undefined) {
                state[device.owner] = {};
            }
            state[device.owner][device.deviceID] = action.payload;
            return state;
        },
        del: (state, action: PayloadAction<IDevice>) => {
            const { owner, deviceID } = action.payload;
            delete state[owner][deviceID];
            return state;
        },
        reset: () => {
            return initialState;
        },
    },
});

export const { reset, del, add } = channelSlice.actions;

export const resetDevices = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const addDevices = (devices: IDevice[]): AppThunk => (dispatch) => {
    for (const device of devices) {
        dispatch(add(device));
    }
};

export const deleteDevice = (device: IDevice): AppThunk => (dispatch) => {
    dispatch(del(device));
};

export const selectDevices: (
    serverID: string
) => (state: RootState) => Record<string, IDevice> = (userID) => ({
    devices,
}) => devices[userID] || {};

export default channelSlice.reducer;
