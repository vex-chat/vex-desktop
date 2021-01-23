import { remote } from "electron";
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
        if (this.instance.get("settings.notifications") == undefined) {
            this.instance.set("settings.notifications", false);
        }

        if (this.instance.get("settings.directMessages") == undefined) {
            this.instance.set("settings.directMessages", true);
        }

        if (this.instance.get("settings.themeColor") == undefined) {
            this.instance.set("settings.themeColor", "#0F0F0F");
        }

        if (this.instance.get("settings.forceMonospace") == undefined) {
            this.instance.set("settings.forceMonospace", false);
        }

        if (this.instance.get("settings.sounds") == undefined) {
            this.instance.set("settings.sounds", true);
        }

        if (this.instance.get("settings.notify.mentions") == undefined) {
            this.instance.set("settings.notify.mentions", true);
        }

        if (this.instance.get("privacyPolicySHA") == undefined) {
            this.instance.set("privacyPolicySHA", null);
        }

        if (this.instance.get("settings.userBarOpen") == undefined) {
            this.instance.set("settings.userBarOpen", true);
        }

        if (this.instance.get("settings.windowDimensions") == undefined) {
            this.instance.set(
                "settings.windowDimensions",
                JSON.stringify(remote.getCurrentWindow().getSize())
            );
        }

        const [width, height]: [width: number, height: number] = JSON.parse(
            this.instance.get("settings.windowDimensions") as string
        );
        remote.getCurrentWindow().setSize(width, height);
        setThemeColor(this.instance.get("settings.themeColor") as string);

        console.log("loaded settings", this.instance.store);

        return DataStore.instance;
    }
}

const store = DataStore.getInstance();

export default store;
