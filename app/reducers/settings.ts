import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";

if (!localStorage.getItem("notifications")) {
    localStorage.setItem("notifications", "true");
}
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const notifications = localStorage.getItem("notifications")!;

const baseSettings: Record<string, string | boolean> = {
    notifications: notifications === "true",
};

const settingSlice = createSlice({
    name: "settings",
    initialState: baseSettings,
    reducers: {
        reset: () => {
            return baseSettings;
        },
        set: (state, action) => {
            const { key, value } = action.payload;
            state[key] = value;
            localStorage.setItem(key, String(value));
            return state;
        },
    },
});

export const { set, reset } = settingSlice.actions;

interface ISettingChange {
    key: string;
    value: boolean | "string";
}

export const setSettings = (settingChange: ISettingChange): AppThunk => (
    dispatch
) => {
    dispatch(set(settingChange));
};

export const resetSettings = (): AppThunk => (dispatch) => {
    dispatch(reset());
};

export const selectSettings = (
    state: RootState
): Record<string, string | boolean> => state.settings;

export default settingSlice.reducer;
