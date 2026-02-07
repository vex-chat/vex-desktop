import { Client, IClientOptions } from "@vex-chat/libvex";
import { XUtils } from "@vex-chat/crypto";
import nacl from "tweetnacl";
import { getDbFolder } from "../constants";

export const createClient = async (
    temp: boolean,
    PK?: string
): Promise<Client> => {
    const host = process.env.VEX_API_HOST || "";
    const isDev = !(await window.electron.app.isPackaged());
    const dbFolder = temp ? undefined : await getDbFolder();

    let token: string | undefined;
    if (PK && !temp && dbFolder) {
        try {
            const keys = nacl.sign.keyPair.fromSecretKey(XUtils.decodeHex(PK));
            const pubKeyHex = XUtils.encodeHex(keys.publicKey);
            const tokenPath = await window.electron.path.join(dbFolder, `${pubKeyHex}.token`);

            console.log("Attempting to load token from:", tokenPath);
            if (await window.electron.fs.exists(tokenPath)) {
                const rawToken = await window.electron.fs.readFile(tokenPath, 'utf8');
                token = String(rawToken).trim(); // Trim whitespace
                console.log("Token loaded, length:", token.length);
            } else {
                console.log("No token file found");
            }
        } catch (err) {
            console.warn("Failed to preload token:", err);
        }
    }

    const options: IClientOptions = {
        dbFolder,
        inMemoryDb: temp,
        host,
        logLevel: isDev ? "info" : "warn",
        dbLogLevel: "info",
        unsafeHttp: host.includes("localhost"),
        token,
    };

    const client = await Client.create(PK, options);

    return client;
};
