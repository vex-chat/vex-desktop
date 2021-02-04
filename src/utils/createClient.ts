import type { IClientOptions } from "@vex-chat/libvex";

import { Client } from "@vex-chat/libvex";

import isDev from "electron-is-dev";

import { dbFolder } from "../constants";

export const createClient = async (
    temp: boolean,
    PK?: string
): Promise<Client> => {
    const host = "api.vex.chat";
    // const host = "localhost:16777";

    const options: IClientOptions = {
        dbFolder: temp ? undefined : dbFolder,
        inMemoryDb: temp,
        host,
        logLevel: isDev ? "info" : "warn",
        dbLogLevel: "info",
        unsafeHttp: host.includes("localhost"),
    };
    return Client.create(PK, options);
};
