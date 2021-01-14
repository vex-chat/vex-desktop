import Store from "electron-store";

import { setThemeColor } from "./setThemeColor";

class DataStore extends Store {
    private static instance: DataStore;

    private constructor() {
        super();
    }

    public static getInstance(): DataStore {
        if (!DataStore.instance) {
            DataStore.instance = new DataStore();
        }

        // set the default values
        if (!this.instance.get("settings.notifications")) {
            this.instance.set("settings.notifications", true);
        }

        if (!this.instance.get("settings.directMessages")) {
            this.instance.set("settings.directMessages", true);
        }

        if (!this.instance.get("settings.themeColor")) {
            this.instance.set("settings.themeColor", "#0F0F0F");
        }

        if (!this.instance.get("settings.forceMonospace")) {
            this.instance.set("settings.forceMonospace", false);
        }

        setThemeColor(this.instance.get("settings.themeColor") as string);

        console.log(this.instance.store);

        return DataStore.instance;
    }
}

const store = DataStore.getInstance();

export default store;
