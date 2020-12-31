import { createSlice } from '@reduxjs/toolkit';
import { IMessage } from '@vex-chat/libvex';
import { AppThunk, RootState } from '../store';

export interface IBaseSerializedMessage {
    mailID: string;
    message: string;
    nonce: string;
    timestamp: string;
    sender: string;
    recipient: string;
    direction: 'incoming' | 'outgoing';
    decrypted: boolean;
    failed: boolean;
    failMessage: string;
}

export interface IGroupSerializedMessage extends IBaseSerializedMessage {
    group: string;
}

export interface INonGroupSerializedMessage extends IBaseSerializedMessage {
    group: null;
}

export type ISerializedMessage =
    | IGroupSerializedMessage
    | INonGroupSerializedMessage;

export function serializeMessage(message: IMessage): ISerializedMessage {
    const serialized: ISerializedMessage = {
        mailID: message.mailID,
        decrypted: message.decrypted,
        message: message.message,
        nonce: message.nonce,
        timestamp: message.timestamp.toString(),
        sender: message.sender,
        recipient: message.recipient,
        direction: message.direction,
        group: message.group,
        failed: false,
        failMessage: '',
    };
    return serialized;
}

const messageSlice = createSlice({
    name: 'messages',
    initialState: {},
    reducers: {
        reset: () => {
            return {};
        },
        add: (
            state: Record<string, Record<string, ISerializedMessage>>,
            action
        ) => {
            const thread =
                action.payload.direction === 'outgoing'
                    ? action.payload.recipient
                    : action.payload.sender;
            const message = action.payload;

            if (!state[thread]) {
                state[thread] = {};
            }

            if (!state[thread][message.mailID]) {
                state[thread][message.mailID] = message;
            }

            return state;
        },
        fail: (
            state: Record<string, Record<string, ISerializedMessage>>,
            action
        ) => {
            const {
                message,
                errorString,
            }: {
                message: ISerializedMessage;
                errorString: string;
            } = action.payload;

            const thread =
                action.payload.message.direction === 'outgoing'
                    ? action.payload.message.recipient
                    : action.payload.message.sender;

            if (
                state[thread] === undefined ||
                state[thread][message.mailID] === undefined
            ) {
                // it doesn't exist, we are done
                return state;
            }

            const failedMessage = state[thread][message.mailID];

            // mark it failed
            failedMessage.failed = true;
            failedMessage.failMessage = errorString;
            state[thread][message.mailID] = failedMessage;

            return state;
        },
    },
});

export const { add, reset, fail } = messageSlice.actions;

export const resetMessages = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const addMessage = (message: IMessage): AppThunk => (dispatch) => {
    const szMsg = serializeMessage(message);
    dispatch(add(szMsg));
};

export const failMessage = (
    message: IMessage,
    errorString: string
): AppThunk => (dispatch) => {
    const szMsg = serializeMessage(message);
    const payload = { message: szMsg, errorString };
    dispatch(fail(payload));
};

export const selectMessages = (
    state: RootState
): Record<string, Record<string, ISerializedMessage>> => state.messages;

export default messageSlice.reducer;
