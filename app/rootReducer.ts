import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { History } from "history";
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function createRootReducer(history: History) {
    const router = connectRouter(history)

    const root = combineReducers({
        router,
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

    return root
}
