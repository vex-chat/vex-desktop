import { combineReducers } from "redux";

import appReducer from "./reducers/app";
import avatarHashReducer from "./reducers/avatarHash";
import channelReducer from "./reducers/channels";
import deviceReducer from "./reducers/devices";
import familiarsReducer from "./reducers/familiars";
import fileReducer from "./reducers/files";
import groupMessageReducer from "./reducers/groupMessages";
import historyStackReducer from "./reducers/historyStacks";
import messageReducer from "./reducers/messages";
import onlineListReducer from "./reducers/onlineLists";
import permissionsReducer from "./reducers/permissions";
import serverReducer from "./reducers/servers";
import sessionReducer from "./reducers/sessions";
import userReducer from "./reducers/user";

export default combineReducers({
    user: userReducer,
    familiars: familiarsReducer,
    messages: messageReducer,
    sessions: sessionReducer,
    app: appReducer,
    servers: serverReducer,
    channels: channelReducer,
    groupMessages: groupMessageReducer,
    permissions: permissionsReducer,
    devices: deviceReducer,
    onlineLists: onlineListReducer,
    historyStacks: historyStackReducer,
    avatarHash: avatarHashReducer,
    files: fileReducer,
});
