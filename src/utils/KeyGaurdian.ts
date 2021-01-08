import { Client } from "@vex-chat/libvex";

class KeyGaurdian {
    private static instance: KeyGaurdian;

    private SK: string | null;
    private username: string | null;
    private password: string | null;

    private constructor() {
        this.SK = null;
        this.username = null;
        this.password = null;
    }

    public static getInstance(): KeyGaurdian {
        if (!KeyGaurdian.instance) {
            KeyGaurdian.instance = new KeyGaurdian();
        }

        return KeyGaurdian.instance;
    }

    public hasKey(): boolean {
        return this.SK !== null;
    }

    public getKey(): string {
        if (!this.SK) {
            throw new Error("Must call load() before using this function.");
        }
        return this.SK;
    }

    public load(path: string, password = ""): void {
        const SK = Client.loadKeyFile(path, password);
        this.SK = SK;
    }

    // store the username and password for later operations
    public setAuthInfo(username: string, password: string) {
        this.username = username;
        this.password = password;
    }

    public getAuthInfo(): [string | null, string | null] {
        return [this.username, this.password];
    }

    public clear(): void {
        this.SK = null;
        this.username = null;
        this.password = null;
    }
}

const guardian = KeyGaurdian.getInstance();

export default guardian;
