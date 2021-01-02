import type { EnhancedStore } from "@reduxjs/toolkit";
import type { RootState } from "~Types";

import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";

import reducer from "./rootReducer";

const logger = createLogger({
    collapsed: true,
    duration: true,
});

export default (): EnhancedStore<RootState> => {
    const store = configureStore({
        reducer,
        middleware: (getDefaultMiddleware) => [
            ...getDefaultMiddleware(),
            logger,
        ],
    });

    if (process.env.NODE_ENV === "development" && module.hot) {
        module.hot.accept("./rootReducer", () => {
            // eslint-disable-next-line  @typescript-eslint/no-var-requires
            store.replaceReducer(require("./rootReducer").default);
        });
    }

    return store;
};
