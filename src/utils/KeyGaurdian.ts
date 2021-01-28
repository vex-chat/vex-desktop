import { Client } from "@vex-chat/libvex";

class KeyGaurdian {
    private static instance: KeyGaurdian;

    private SK: string | null;
    private keyFilePath: string | null;

    private constructor() {
        this.SK = null;
        this.keyFilePath = null;
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
            throw new Error(
                "Must call load() or setKey() before using this function."
            );
        }
        return this.SK;
    }

    public setKey(key: string): void {
        this.SK = key;
    }

    public load(path: string, password = ""): void {
        const SK = Client.loadKeyFile(path, password);
        this.SK = SK;
        this.keyFilePath = path;
    }

    public clear(): void {
        this.SK = null;
    }

    public getKeyFilePath() {
        return this.keyFilePath;
    }
}

const guardian = KeyGaurdian.getInstance();

export default guardian;
