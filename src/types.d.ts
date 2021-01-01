import type { Action } from "@reduxjs/toolkit";
import type { ThunkAction } from "redux-thunk";

export type RootState = ReturnType<typeof import("./rootReducer").default>;
export type Store = ReturnType<typeof import("./store").default>;

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

// Types that are not related to Global Redux should be considered to be defined locally or in type lib
export interface IServerParams {
    serverID: string;
    channelID: string;
}
