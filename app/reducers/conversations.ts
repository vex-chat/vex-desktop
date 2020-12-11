import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { XTypes } from "@vex-chat/types-js";
import { ISession } from "@vex-chat/vex-js";

interface ISerializedSession {
    sessionID: string;
    userID: string;
    mode: "initiator" | "receiver";
    SK: string;
    publicKey: string;
    fingerprint: string;
    lastUsed: string;
    verified: boolean;
}

export const deserializeSession = (
    session: ISerializedSession
): XTypes.SQL.ISession => {
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

export const serializeSession = (
    session: XTypes.SQL.ISession
): ISerializedSession => {
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

const conversationSlice = createSlice({
    name: "conversations",
    initialState: {},
    reducers: {
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

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (state[payload.userID!] === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                state[payload.userID!] = {};
            }

            state[payload.userID][payload.fingerprint] = payload;

            return state;
        },
    },
});

export const { set, add, stub, reset } = conversationSlice.actions;

export const addConversation = (
    conversation: XTypes.SQL.ISession
): AppThunk => (dispatch) => {
    dispatch(add(serializeSession(conversation)));
};

export const stubConversation = (userID: string): AppThunk => (dispatch) => {
    dispatch(stub(userID));
};

export const setConversations = (
    conversations: Record<string, ISession[]>
): AppThunk => (dispatch) => {
    dispatch(resetConversations());
    for (const userID in conversations) {
        for (const session of conversations[userID]) {
            dispatch(add(serializeSession(session)));
        }
    }
};

export const resetConversations = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectConversations = (
    state: RootState
): Record<string, Record<string, XTypes.SQL.ISession>> => state.conversations;

export default conversationSlice.reducer;
