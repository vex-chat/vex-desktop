import { loadKeyFile } from "../views/Register";

export class KeyGaurdian {
    private SK: string | null = null;

    public hasKey(): boolean {
        return this.SK !== null;
    }

    public getKey(): string {
        if (!this.SK) {
            throw new Error("Must call load() before using this function.");
        }
        return this.SK;
    }

    public load(path: string, password: string): void {
        const SK = loadKeyFile(path, password);
        this.SK = SK;
    }
}
