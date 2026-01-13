/**
 * Preload script for Electron contextBridge
 *
 * This script runs in a privileged context and exposes safe APIs
 * to the renderer process via contextBridge.exposeInMainWorld().
 *
 * The renderer accesses these APIs via window.electron.*
 *
 * @see https://www.electronjs.org/docs/latest/tutorial/context-isolation
 */

import { contextBridge, ipcRenderer } from "electron";

// Type definitions for the exposed API
export interface ElectronAPI {
    // Window control
    window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        unmaximize: () => Promise<void>;
        close: () => Promise<void>;
        show: () => Promise<void>;
        hide: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
        setSize: (width: number, height: number) => Promise<void>;
        getSize: () => Promise<[number, number]>;
    };

    // Dialog operations
    dialog: {
        showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogResult>;
        showSaveDialog: (options: SaveDialogOptions) => Promise<SaveDialogResult>;
    };

    // File system operations
    fs: {
        readFile: (path: string, encoding?: string) => Promise<string | Buffer>;
        writeFile: (path: string, data: string | Buffer) => Promise<void>;
        exists: (path: string) => Promise<boolean>;
        mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
        readdir: (path: string) => Promise<string[]>;
        unlink: (path: string) => Promise<void>;
        stat: (path: string) => Promise<FileStats>;
        rename: (oldPath: string, newPath: string) => Promise<void>;
    };

    // Path operations
    path: {
        join: (...paths: string[]) => Promise<string>;
        resolve: (...paths: string[]) => Promise<string>;
        dirname: (p: string) => Promise<string>;
        basename: (p: string, ext?: string) => Promise<string>;
        extname: (p: string) => Promise<string>;
    };

    // App operations
    app: {
        relaunch: () => Promise<void>;
        quit: () => Promise<void>;
        getPath: (
            name:
                | "home"
                | "appData"
                | "userData"
                | "temp"
                | "downloads"
                | "documents"
        ) => Promise<string>;
        isPackaged: () => Promise<boolean>;
        getVersion: () => Promise<string>;
    };

    // Shell operations
    shell: {
        openExternal: (url: string) => Promise<void>;
        openPath: (path: string) => Promise<string>;
    };

    // Clipboard operations
    clipboard: {
        writeText: (text: string) => Promise<void>;
        readText: () => Promise<string>;
    };

    // Session/cookies operations
    cookies: {
        get: (filter: CookieFilter) => Promise<Cookie[]>;
        set: (details: CookieDetails) => Promise<void>;
        remove: (url: string, name: string) => Promise<void>;
    };

    // IPC event listeners
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (channel: AllowedChannel, callback: (...args: any[]) => void) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once: (channel: AllowedChannel, callback: (...args: any[]) => void) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off: (channel: AllowedChannel, callback: (...args: any[]) => void) => void;

    // Send message to main process (for future use)
    send: (channel: AllowedSendChannel, ...args: unknown[]) => void;
    invoke: (channel: AllowedInvokeChannel, ...args: unknown[]) => Promise<unknown>;
}

// Allowed channels for security (whitelist approach)
type AllowedChannel = "open-url" | "autoUpdater" | "relaunch" | "window:resize";
type AllowedSendChannel = "app:relaunch" | "window:minimize";
type AllowedInvokeChannel =
    | "window:minimize"
    | "window:maximize"
    | "window:unmaximize"
    | "window:close"
    | "window:show"
    | "window:hide"
    | "window:isMaximized"
    | "window:setSize"
    | "window:getSize"
    | "dialog:showOpen"
    | "dialog:showSave"
    | "fs:readFile"
    | "fs:writeFile"
    | "fs:exists"
    | "fs:mkdir"
    | "fs:readdir"
    | "fs:unlink"
    | "fs:stat"
    | "fs:rename"
    | "path:join"
    | "path:resolve"
    | "path:dirname"
    | "path:basename"
    | "path:extname"
    | "app:relaunch"
    | "app:quit"
    | "app:getPath"
    | "app:isPackaged"
    | "app:getVersion"
    | "shell:openExternal"
    | "shell:openPath"
    | "clipboard:writeText"
    | "clipboard:readText"
    | "cookies:get"
    | "cookies:set"
    | "cookies:remove";

// Type definitions for dialog options
interface OpenDialogOptions {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: { name: string; extensions: string[] }[];
    properties?: (
        | "openFile"
        | "openDirectory"
        | "multiSelections"
        | "showHiddenFiles"
    )[];
}

interface OpenDialogResult {
    canceled: boolean;
    filePaths: string[];
}

interface SaveDialogOptions {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: { name: string; extensions: string[] }[];
}

interface SaveDialogResult {
    canceled: boolean;
    filePath?: string;
}

interface FileStats {
    isFile: boolean;
    isDirectory: boolean;
    size: number;
    mtime: number;
}

interface CookieFilter {
    url?: string;
    name?: string;
    domain?: string;
    path?: string;
    secure?: boolean;
    session?: boolean;
}

interface Cookie {
    name: string;
    value: string;
    domain?: string;
    hostOnly?: boolean;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    session?: boolean;
    expirationDate?: number;
}

interface CookieDetails {
    url: string;
    name: string;
    value: string;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    expirationDate?: number;
}

// Channel whitelist for security
const ALLOWED_RECEIVE_CHANNELS: AllowedChannel[] = [
    "open-url",
    "autoUpdater",
    "relaunch",
    "window:resize",
];

// The API object to expose
const electronAPI: ElectronAPI = {
    // Window control
    window: {
        minimize: () => ipcRenderer.invoke("window:minimize"),
        maximize: () => ipcRenderer.invoke("window:maximize"),
        unmaximize: () => ipcRenderer.invoke("window:unmaximize"),
        close: () => ipcRenderer.invoke("window:close"),
        show: () => ipcRenderer.invoke("window:show"),
        hide: () => ipcRenderer.invoke("window:hide"),
        isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
        setSize: (width: number, height: number) =>
            ipcRenderer.invoke("window:setSize", width, height),
        getSize: () => ipcRenderer.invoke("window:getSize"),
    },

    // Dialog operations
    dialog: {
        showOpenDialog: (options: OpenDialogOptions) =>
            ipcRenderer.invoke("dialog:showOpen", options),
        showSaveDialog: (options: SaveDialogOptions) =>
            ipcRenderer.invoke("dialog:showSave", options),
    },

    // File system operations
    fs: {
        readFile: (path: string, encoding?: string) =>
            ipcRenderer.invoke("fs:readFile", path, encoding),
        writeFile: (path: string, data: string | Buffer) =>
            ipcRenderer.invoke("fs:writeFile", path, data),
        exists: (path: string) => ipcRenderer.invoke("fs:exists", path),
        mkdir: (path: string, options?: { recursive?: boolean }) =>
            ipcRenderer.invoke("fs:mkdir", path, options),
        readdir: (path: string) => ipcRenderer.invoke("fs:readdir", path),
        unlink: (path: string) => ipcRenderer.invoke("fs:unlink", path),
        stat: (path: string) => ipcRenderer.invoke("fs:stat", path),
        rename: (oldPath: string, newPath: string) =>
            ipcRenderer.invoke("fs:rename", oldPath, newPath),
    },

    // Path operations
    path: {
        join: (...paths: string[]) => ipcRenderer.invoke("path:join", ...paths),
        resolve: (...paths: string[]) =>
            ipcRenderer.invoke("path:resolve", ...paths),
        dirname: (p: string) => ipcRenderer.invoke("path:dirname", p),
        basename: (p: string, ext?: string) =>
            ipcRenderer.invoke("path:basename", p, ext),
        extname: (p: string) => ipcRenderer.invoke("path:extname", p),
    },

    // App operations
    app: {
        relaunch: () => ipcRenderer.invoke("app:relaunch"),
        quit: () => ipcRenderer.invoke("app:quit"),
        getPath: (
            name:
                | "home"
                | "appData"
                | "userData"
                | "temp"
                | "downloads"
                | "documents"
        ) => ipcRenderer.invoke("app:getPath", name),
        isPackaged: () => ipcRenderer.invoke("app:isPackaged"),
        getVersion: () => ipcRenderer.invoke("app:getVersion"),
    },

    // Shell operations
    shell: {
        openExternal: (url: string) =>
            ipcRenderer.invoke("shell:openExternal", url),
        openPath: (path: string) => ipcRenderer.invoke("shell:openPath", path),
    },

    // Clipboard operations
    clipboard: {
        writeText: (text: string) =>
            ipcRenderer.invoke("clipboard:writeText", text),
        readText: () => ipcRenderer.invoke("clipboard:readText"),
    },

    // Session/cookies operations
    cookies: {
        get: (filter: CookieFilter) => ipcRenderer.invoke("cookies:get", filter),
        set: (details: CookieDetails) =>
            ipcRenderer.invoke("cookies:set", details),
        remove: (url: string, name: string) =>
            ipcRenderer.invoke("cookies:remove", url, name),
    },

    // IPC event listeners with channel validation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (channel: AllowedChannel, callback: (...args: any[]) => void) => {
        if (ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
            ipcRenderer.on(channel, callback);
        } else {
            console.error(`Blocked attempt to listen on channel: ${channel}`);
        }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once: (channel: AllowedChannel, callback: (...args: any[]) => void) => {
        if (ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
            ipcRenderer.once(channel, callback);
        } else {
            console.error(`Blocked attempt to listen once on channel: ${channel}`);
        }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off: (channel: AllowedChannel, callback: (...args: any[]) => void) => {
        if (ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
            ipcRenderer.off(channel, callback);
        } else {
            console.error(
                `Blocked attempt to remove listener from channel: ${channel}`
            );
        }
    },

    // Generic send (validated by main process)
    send: (channel: AllowedSendChannel, ...args: unknown[]) => {
        ipcRenderer.send(channel, ...args);
    },

    // Generic invoke (validated by main process)
    invoke: (channel: AllowedInvokeChannel, ...args: unknown[]) => {
        return ipcRenderer.invoke(channel, ...args);
    },
};

// Expose the API - use contextBridge if available (contextIsolation enabled),
// otherwise assign directly to window (for nodeIntegration: true environments)
try {
    // This will work when contextIsolation is true
    contextBridge.exposeInMainWorld("electron", electronAPI);
    console.log("Preload: exposed via contextBridge");
} catch {
    // Fallback for when contextIsolation is false (nodeIntegration: true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).electron = electronAPI;
    console.log("Preload: exposed directly on window");
}

// Log that preload script has loaded
console.log("Preload script loaded successfully");
