import { combineReducers } from "redux";
import userReducer from "./reducers/user";
import familiarsReducer from "./reducers/familiars";
import inputsReducer from "./reducers/inputs";
import messageReducer from "./reducers/messages";
import sessionReducer from "./reducers/sessions";
import appReducer from "./reducers/app";
import serverReducer from "./reducers/servers";
import channelReducer from "./reducers/channels";
import permissionsReducer from "./reducers/permissions";
import groupMessageReducer from "./reducers/groupMessages";

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
