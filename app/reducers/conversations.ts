import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { XTypes } from "@vex-chat/types-js";

const conversationSlice = createSlice({
    name: "conversations",
    initialState: {},
    reducers: {
        set: (
            _state: Record<string, Record<string, XTypes.SQL.ISession>>,
            action
        ) => {
            return action.payload;
        },
        reset: () => {
            return {};
        },
        stub: (
            state: Record<string, Record<string, XTypes.SQL.ISession>>,
            action
        ) => {
            if (state[action.payload] === undefined) {
                state[action.payload] = {};
            }
        },
        add: (
            state: Record<string, Record<string, XTypes.SQL.ISession>>,
            action
        ) => {
            const payload: XTypes.SQL.ISession = action.payload;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (state[payload.userID!] === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                state[payload.userID!] = {};
            } else {
                if (payload.fingerprint !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    state[payload.userID!][payload.fingerprint] = payload;
                }
            }

            return state;
        },
    },
});

export const { set, add, stub, reset } = conversationSlice.actions;

export const addConversation = (
    conversation: XTypes.SQL.ISession
): AppThunk => (dispatch) => {
    dispatch(add(conversation));
};

export const stubConversation = (userID: string): AppThunk => (dispatch) => {
    dispatch(stub(userID));
};

export const setConversations = (
    state: Record<string, Record<string, XTypes.SQL.ISession>>
): AppThunk => (dispatch) => {
    dispatch(set(state));
};

export const resetConversations = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectConversations = (
    state: RootState
): Record<string, Record<string, XTypes.SQL.ISession>> => state.conversations;

export default conversationSlice.reducer;
