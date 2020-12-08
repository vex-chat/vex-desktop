import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { History } from "history";
import counterReducer from "./reducers/counter";
import userReducer from "./reducers/user";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function createRootReducer(history: History) {
    return combineReducers({
        router: connectRouter(history),
        counter: counterReducer,
        user: userReducer,
    });
}
