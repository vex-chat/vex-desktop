import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { History } from "history";
import userReducer from "./reducers/user";
import familiarsReducer from "./reducers/familiars";
import inputsReducer from "./reducers/inputs";
import messageReducer from "./reducers/messages";
import conversationReducer from "./reducers/conversations";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function createRootReducer(history: History) {
    return combineReducers({
        router: connectRouter(history),
        user: userReducer,
        familiars: familiarsReducer,
        inputs: inputsReducer,
        messages: messageReducer,
        conversations: conversationReducer,
    });
}
