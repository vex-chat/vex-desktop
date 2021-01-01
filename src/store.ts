import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";

import type { RootState } from "~Types";

import rootReducer from "./rootReducer";

const logger = createLogger({
    collapsed: true,
    duration: true,
});

const middleware = [...getDefaultMiddleware(), logger];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
            // eslint-disable-next-line  @typescript-eslint/no-var-requires
            () => store.replaceReducer(require("./rootReducer").default)
        );
    }
    return store;
};

export type Store = ReturnType<typeof configuredStore>;
