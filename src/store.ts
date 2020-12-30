import { configureStore, getDefaultMiddleware, Action } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import createRootReducer from "./rootReducer";

const rootReducer = createRootReducer();
export type RootState = ReturnType<typeof rootReducer>;

const middleware = [...getDefaultMiddleware()];

export const configuredStore = (initialState?: RootState) => {
    // Create Store
    const store = configureStore({
        reducer: rootReducer,
        middleware,
        preloadedState: initialState,
    });

    if (process.env.NODE_ENV === "development" && module.hot) {
        module.hot.accept(
            "./rootReducer",
            // eslint-disable-next-line no-var-requires
            () => store.replaceReducer(require("./rootReducer").default)
        );
    }
    return store;
};

export type Store = ReturnType<typeof configuredStore>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
