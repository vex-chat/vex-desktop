import type { RootState, AppThunk } from '~Types';

import { createSlice } from '@reduxjs/toolkit';
import { ISession } from '@vex-chat/libvex';

interface ISerializedSession {
    sessionID: string;
    userID: string;
    mode: 'initiator' | 'receiver';
    SK: string;
    publicKey: string;
    fingerprint: string;
    lastUsed: string;
    verified: boolean;
}

export const deserializeSession = (session: ISerializedSession): ISession => {
    return {
        sessionID: session.sessionID,
        userID: session.userID,
        mode: session.mode,
        SK: session.SK,
        publicKey: session.publicKey,
        fingerprint: session.fingerprint,
        lastUsed: new Date(session.lastUsed),
        verified: session.verified,
    };
};

export const serializeSession = (session: ISession): ISerializedSession => {
    return {
        sessionID: session.sessionID,
        userID: session.userID,
        mode: session.mode,
        SK: session.SK,
        publicKey: session.publicKey,
        fingerprint: session.fingerprint,
        lastUsed: session.lastUsed.toString(),
        verified: session.verified,
    };
};

const sessionSlice = createSlice({
    name: 'sessions',
    initialState: {},
    reducers: {
        mark: (
            state: Record<string, Record<string, ISerializedSession>>,
            action
        ) => {
            const { userID, sessionID, status } = action.payload;

            if (!state[userID] || !state[userID][sessionID]) {
                return state;
            }

            state[userID][sessionID].verified = Boolean(status);
            return state;
        },
        set: (
            _state: Record<string, Record<string, ISerializedSession>>,
            action
        ) => {
            return action.payload;
        },
        reset: () => {
            return {};
        },
        stub: (
            state: Record<string, Record<string, ISerializedSession>>,
            action
        ) => {
            if (state[action.payload] === undefined) {
                state[action.payload] = {};
            }
        },
        add: (
            state: Record<string, Record<string, ISerializedSession>>,
            action
        ) => {
            const payload: ISerializedSession = action.payload;

            if (state[payload.userID] === undefined) {
                state[payload.userID] = {};
            }

            state[payload.userID][payload.sessionID] = payload;

            return state;
        },
    },
});

export const { set, add, stub, reset, mark } = sessionSlice.actions;

export const addSession = (session: ISession): AppThunk => (dispatch) => {
    dispatch(add(serializeSession(session)));
};

export const stubSession = (userID: string): AppThunk => (dispatch) => {
    dispatch(stub(userID));
};

export const markSession = (
    userID: string,
    sessionID: string,
    status: boolean
): AppThunk => (dispatch) => {
    const payload = { userID, sessionID, status };
    dispatch(mark(payload));
};

export const setSessions = (sessions: Record<string, ISession[]>): AppThunk => (
    dispatch
) => {
    dispatch(resetSessions());
    for (const userID in sessions) {
        for (const session of sessions[userID]) {
            dispatch(add(serializeSession(session)));
        }
    }
};

export const resetSessions = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectSessions = (
    state: RootState
): Record<string, Record<string, ISession>> => state.sessions;

export default sessionSlice.reducer;
