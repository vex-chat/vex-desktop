import { combineReducers } from "redux";

import appReducer from "./reducers/app";
import channelReducer from "./reducers/channels";
import familiarsReducer from "./reducers/familiars";
import groupMessageReducer from "./reducers/groupMessages";
import inputsReducer from "./reducers/inputs";
import messageReducer from "./reducers/messages";
import permissionsReducer from "./reducers/permissions";
import serverReducer from "./reducers/servers";
import sessionReducer from "./reducers/sessions";
import userReducer from "./reducers/user";

export default combineReducers({
    user: userReducer,
    familiars: familiarsReducer,
    inputs: inputsReducer,
    messages: messageReducer,
    sessions: sessionReducer,
    app: appReducer,
    servers: serverReducer,
    channels: channelReducer,
    groupMessages: groupMessageReducer,
    permissions: permissionsReducer,
});
