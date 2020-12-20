import { xConcat, xMakeNonce, XUtils } from "@vex-chat/crypto-js";
import { pbkdf2Sync } from "pbkdf2";
import fs from "fs";
import nacl from "tweetnacl";

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

    public clear(): void {
        this.SK = null;
    }
}

export const saveKeyFile = (
    path: string,
    password: string,
    secretKey: string
): void => {
    const UNENCRYPTED_SIGNKEY = XUtils.decodeHex(secretKey);

    // generate random amount of iterations
    const R1 = nacl.randomBytes(1);
    const R2 = nacl.randomBytes(1);
    const N1 = XUtils.uint8ArrToNumber(R1);
    const N2 = XUtils.uint8ArrToNumber(R2);
    const iterations = N1 * N2;

    // length 6
    const ITERATIONS = XUtils.numberToUint8Arr(iterations);

    // length 24
    const PKBDF_SALT = xMakeNonce();

    // derived key to encrypt our signkeys with
    const ENCRYPTION_KEY = Uint8Array.from(
        pbkdf2Sync(password, PKBDF_SALT, iterations, 32)
    );
    const NONCE = xMakeNonce();

    const ENCRYPTED_SIGNKEY = nacl.secretbox(
        UNENCRYPTED_SIGNKEY,
        NONCE,
        ENCRYPTION_KEY
    );
    fs.writeFileSync(
        path,
        xConcat(ITERATIONS, PKBDF_SALT, NONCE, ENCRYPTED_SIGNKEY)
    );
};

export const loadKeyFile = (path: string, password: string): string => {
    const keyFile = Uint8Array.from(fs.readFileSync(path));
    const ITERATIONS = XUtils.uint8ArrToNumber(keyFile.slice(0, 6));
    const PKBDF_SALT = keyFile.slice(6, 30);
    const ENCRYPTION_NONCE = keyFile.slice(30, 54);
    // this is the id key we need to decrypt
    const ENCRYPTED_KEY = keyFile.slice(54);
    // the derived key from the user's password
    const DERIVED_KEY = Uint8Array.from(
        pbkdf2Sync(password, PKBDF_SALT, ITERATIONS, 32)
    );

    const DECRYPTED_SIGNKEY = nacl.secretbox.open(
        ENCRYPTED_KEY,
        ENCRYPTION_NONCE,
        DERIVED_KEY
    );

    if (!DECRYPTED_SIGNKEY) {
        throw new Error("Decryption failed. Wrong password?");
    } else {
        return XUtils.encodeHex(DECRYPTED_SIGNKEY);
    }
};
