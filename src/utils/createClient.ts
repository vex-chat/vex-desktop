import type { IClientOptions } from "@vex-chat/libvex";

import { Client } from "@vex-chat/libvex";

import isDev from "electron-is-dev";

import { dbFolder } from "../constants";

export const createClient = async (
    temp: boolean,
    PK?: string
): Promise<Client> => {
    const host = "api.vex.chat";

    const options: IClientOptions = {
        dbFolder,
        inMemoryDb: temp,
        host,
        logLevel: isDev ? "info" : "warn",
        unsafeHttp: host.includes("localhost"),
    };
    return Client.create(PK, options);
};
