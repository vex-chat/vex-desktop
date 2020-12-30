import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { IServer } from "@vex-chat/libvex";

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
        reset: () => {
            return {};
        },
    },
});

export const { add, reset } = serverSlice.actions;

export const resetServers = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const setServers = (servers: IServer[]): AppThunk => (dispatch) => {
    dispatch(reset());
    for (const server of servers) {
        dispatch(add(server));
    }
};

export const addServer = (server: IServer): AppThunk => (dispatch) => {
    dispatch(add(server));
};

export const selectServers = (state: RootState): Record<string, IServer> =>
    state.servers;

export default serverSlice.reducer;
