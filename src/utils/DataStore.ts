import { setThemeColor } from "./setThemeColor";

/**
 * DataStore - A localStorage-based settings store
 * Replaces electron-store for contextIsolation compatibility
 */
class DataStore {
    private static instance: DataStore;
    private static initialized: boolean;
    private storageKey: string;
    private data: Record<string, unknown>;

    private constructor() {
        this.storageKey = "vex-desktop-settings";
        const stored = localStorage.getItem(this.storageKey);
        this.data = stored ? JSON.parse(stored) : {};
    }

    private save(): void {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    public get(key: string): unknown {
        const keys = key.split(".");
        let value: unknown = this.data;
        for (const k of keys) {
            if (value && typeof value === "object" && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return undefined;
            }
        }
        return value;
    }

    public set(key: string, value: unknown): void {
        const keys = key.split(".");
        let obj = this.data;
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in obj) || typeof obj[k] !== "object") {
                obj[k] = {};
            }
            obj = obj[k] as Record<string, unknown>;
        }
        obj[keys[keys.length - 1]] = value;
        this.save();
    }

    public get store(): Record<string, unknown> {
        return this.data;
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
            this.instance.set("settings.themeColor", "white");
        }

        if (
            this.instance.get("settings.themeColor") !== "white" &&
            this.instance.get("settings.themeColor") !== "black"
        ) {
            this.instance.set("settings.themeColor", "white");
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

        setThemeColor(
            this.instance.get("settings.themeColor") as "white" | "black"
        );

        console.log("loaded settings", this.instance.store);

        return DataStore.instance;
    }

    /**
     * Initialize window dimensions from stored settings.
     * Must be called after the window.electron API is available.
     */
    public static async initWindowDimensions(): Promise<void> {
        if (DataStore.initialized) {
            return;
        }
        DataStore.initialized = true;

        const instance = this.getInstance();

        if (instance.get("settings.windowDimensions") == undefined) {
            const size = await window.electron.window.getSize();
            instance.set("settings.windowDimensions", JSON.stringify(size));
        }

        const [width, height]: [width: number, height: number] = JSON.parse(
            instance.get("settings.windowDimensions") as string
        );
        await window.electron.window.setSize(width, height);
    }
}

const store = DataStore.getInstance();

export { DataStore };
export default store;
