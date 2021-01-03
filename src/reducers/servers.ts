import type { IServer } from "@vex-chat/libvex";
import type { AppThunk, RootState } from "~Types";

import { createSlice } from "@reduxjs/toolkit";

const initialState: Record<string, IServer> = {};

const serverSlice = createSlice({
    name: "servers",
    initialState,
    reducers: {
        add: (state, action) => {
            const server: IServer = action.payload;
            state[server.serverID] = server;
            return state;
        },
        del: (state, action) => {
            const serverID: string = action.payload;
            delete state[serverID];
            return state;
        },
        reset: () => {
            return {};
        },
    },
});

export const { add, del, reset } = serverSlice.actions;

export const resetServers = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const setServers = (servers: IServer[]): AppThunk => (dispatch) => {
    dispatch(reset());
    for (const server of servers) {
        dispatch(add(server));
    }
};

export const delServer = (serverID: string): AppThunk => (dispatch) => {
    dispatch(del(serverID));
};

export const addServer = (server: IServer): AppThunk => (dispatch) => {
    dispatch(add(server));
};

export const selectServers = (state: RootState): Record<string, IServer> =>
    state.servers;

export default serverSlice.reducer;
