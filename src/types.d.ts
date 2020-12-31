import type { Action } from '@reduxjs/toolkit';
import type { ThunkAction } from 'redux-thunk';

import rootReducer from './rootReducer'

export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
export interface IServerParams {
    serverID: string;
    channelID: string;
}