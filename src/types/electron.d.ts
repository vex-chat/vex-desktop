/**
 * Type definitions for the Electron contextBridge API
 *
 * This file extends the global Window interface to include
 * the electron API exposed by the preload script.
 *
 * Usage in renderer:
 *   window.electron.window.minimize()
 *   window.electron.fs.readFile('/path/to/file')
 */

// Dialog options and results
export interface OpenDialogOptions {
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

export interface OpenDialogResult {
    canceled: boolean;
    filePaths: string[];
}

export interface SaveDialogOptions {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: { name: string; extensions: string[] }[];
}

export interface SaveDialogResult {
    canceled: boolean;
    filePath?: string;
}

// File system types
export interface FileStats {
    isFile: boolean;
    isDirectory: boolean;
    size: number;
    mtime: number;
}

// Cookie types
export interface CookieFilter {
    url?: string;
    name?: string;
    domain?: string;
    path?: string;
    secure?: boolean;
    session?: boolean;
}

export interface Cookie {
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

export interface CookieDetails {
    url: string;
    name: string;
    value: string;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    expirationDate?: number;
}

// Allowed IPC channels
export type AllowedReceiveChannel =
    | "open-url"
    | "autoUpdater"
    | "relaunch"
    | "window:resize";

export type AppPathName =
    | "home"
    | "appData"
    | "userData"
    | "temp"
    | "downloads"
    | "documents";

// Main API interface
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
        getPath: (name: AppPathName) => Promise<string>;
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
    on: (channel: AllowedReceiveChannel, callback: (...args: any[]) => void) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once: (channel: AllowedReceiveChannel, callback: (...args: any[]) => void) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off: (channel: AllowedReceiveChannel, callback: (...args: any[]) => void) => void;

    // Generic IPC methods
    send: (channel: string, ...args: unknown[]) => void;
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
}

// Extend the global Window interface
declare global {
    interface Window {
        electron: ElectronAPI;
    }
}

export {};
