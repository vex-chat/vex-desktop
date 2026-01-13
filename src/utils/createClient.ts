import type { IClientOptions } from "@vex-chat/libvex";

import { Client } from "@vex-chat/libvex";

import { getDbFolder } from "../constants";

export const createClient = async (
    temp: boolean,
    PK?: string
): Promise<Client> => {
    // defined in webpack config
    const host = process.env.VEX_API_HOST || "";

    // isDev = !isPackaged
    const isDev = !(await window.electron.app.isPackaged());

    const options: IClientOptions = {
        dbFolder: temp ? undefined : await getDbFolder(),
        inMemoryDb: temp,
        host,
        logLevel: isDev ? "info" : "warn",
        dbLogLevel: "info",
        unsafeHttp: host.includes("localhost"),
    };
    return Client.create(PK, options);
};
