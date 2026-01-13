/**
 * IPC Handlers for Electron main process
 *
 * This module registers all ipcMain.handle() methods that respond
 * to IPC calls from the preload script (contextBridge).
 *
 * These handlers enable secure communication between the renderer
 * and main process without exposing Node.js APIs directly.
 */

import {
    app,
    BrowserWindow,
    clipboard,
    dialog,
    ipcMain,
    shell,
} from "electron";
import fs from "fs";
import path from "path";

/**
 * Register all IPC handlers
 * Call this function once during app initialization
 */
export function registerIpcHandlers(): void {
    // ═══════════════════════════════════════════════════════════
    // WINDOW CONTROL HANDLERS
    // ═══════════════════════════════════════════════════════════

    ipcMain.handle("window:minimize", (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window?.minimize();
    });

    ipcMain.handle("window:maximize", (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window?.maximize();
    });

    ipcMain.handle("window:unmaximize", (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window?.unmaximize();
    });

    ipcMain.handle("window:close", (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window?.close();
    });

    ipcMain.handle("window:show", (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window?.show();
    });

    ipcMain.handle("window:hide", (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window?.hide();
    });

    ipcMain.handle("window:isMaximized", (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        return window?.isMaximized() ?? false;
    });

    ipcMain.handle(
        "window:setSize",
        (event, width: number, height: number) => {
            const window = BrowserWindow.fromWebContents(event.sender);
            if (
                typeof width === "number" &&
                typeof height === "number" &&
                width > 0 &&
                height > 0
            ) {
                window?.setSize(Math.round(width), Math.round(height));
            }
        }
    );

    ipcMain.handle("window:getSize", (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        return window?.getSize() ?? [800, 600];
    });

    // ═══════════════════════════════════════════════════════════
    // DIALOG HANDLERS
    // ═══════════════════════════════════════════════════════════

    ipcMain.handle("dialog:showOpen", async (event, options) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window) {
            return { canceled: true, filePaths: [] };
        }
        return dialog.showOpenDialog(window, options);
    });

    ipcMain.handle("dialog:showSave", async (event, options) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window) {
            return { canceled: true, filePath: undefined };
        }
        return dialog.showSaveDialog(window, options);
    });

    // ═══════════════════════════════════════════════════════════
    // FILE SYSTEM HANDLERS
    // ═══════════════════════════════════════════════════════════

    ipcMain.handle(
        "fs:readFile",
        (_event, filePath: string, encoding?: string) => {
            // Validate path
            if (typeof filePath !== "string" || filePath.length === 0) {
                throw new Error("Invalid file path");
            }

            try {
                if (encoding) {
                    return fs.readFileSync(filePath, {
                        encoding: encoding as BufferEncoding,
                    });
                }
                return fs.readFileSync(filePath);
            } catch (error) {
                throw new Error(
                    `Failed to read file: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
            }
        }
    );

    ipcMain.handle(
        "fs:writeFile",
        (_event, filePath: string, data: string | Buffer) => {
            if (typeof filePath !== "string" || filePath.length === 0) {
                throw new Error("Invalid file path");
            }

            try {
                fs.writeFileSync(filePath, data);
            } catch (error) {
                throw new Error(
                    `Failed to write file: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
            }
        }
    );

    ipcMain.handle("fs:exists", (_event, filePath: string) => {
        if (typeof filePath !== "string") {
            return false;
        }
        return fs.existsSync(filePath);
    });

    ipcMain.handle(
        "fs:mkdir",
        (_event, dirPath: string, options?: { recursive?: boolean }) => {
            if (typeof dirPath !== "string" || dirPath.length === 0) {
                throw new Error("Invalid directory path");
            }

            try {
                fs.mkdirSync(dirPath, options);
            } catch (error) {
                throw new Error(
                    `Failed to create directory: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
            }
        }
    );

    ipcMain.handle("fs:readdir", (_event, dirPath: string) => {
        if (typeof dirPath !== "string" || dirPath.length === 0) {
            throw new Error("Invalid directory path");
        }

        try {
            return fs.readdirSync(dirPath);
        } catch (error) {
            throw new Error(
                `Failed to read directory: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    });

    ipcMain.handle("fs:unlink", (_event, filePath: string) => {
        if (typeof filePath !== "string" || filePath.length === 0) {
            throw new Error("Invalid file path");
        }

        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            throw new Error(
                `Failed to delete file: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    });

    ipcMain.handle("fs:stat", (_event, filePath: string) => {
        if (typeof filePath !== "string" || filePath.length === 0) {
            throw new Error("Invalid file path");
        }

        try {
            const stats = fs.statSync(filePath);
            return {
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                size: stats.size,
                mtime: stats.mtime.getTime(),
            };
        } catch (error) {
            throw new Error(
                `Failed to get file stats: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    });

    ipcMain.handle(
        "fs:rename",
        async (_event, oldPath: string, newPath: string) => {
            if (
                typeof oldPath !== "string" ||
                oldPath.length === 0 ||
                typeof newPath !== "string" ||
                newPath.length === 0
            ) {
                throw new Error("Invalid path");
            }

            return new Promise<void>((resolve, reject) => {
                fs.rename(oldPath, newPath, (err) => {
                    if (err) {
                        reject(
                            new Error(
                                `Failed to rename file: ${err.message}`
                            )
                        );
                    } else {
                        resolve();
                    }
                });
            });
        }
    );

    // ═══════════════════════════════════════════════════════════
    // PATH HANDLERS
    // ═══════════════════════════════════════════════════════════

    ipcMain.handle("path:join", (_event, ...paths: string[]) => {
        if (!paths.every((p) => typeof p === "string")) {
            throw new Error("All path segments must be strings");
        }
        return path.join(...paths);
    });

    ipcMain.handle("path:resolve", (_event, ...paths: string[]) => {
        if (!paths.every((p) => typeof p === "string")) {
            throw new Error("All path segments must be strings");
        }
        return path.resolve(...paths);
    });

    ipcMain.handle("path:dirname", (_event, filePath: string) => {
        if (typeof filePath !== "string") {
            throw new Error("Path must be a string");
        }
        return path.dirname(filePath);
    });

    ipcMain.handle(
        "path:basename",
        (_event, filePath: string, ext?: string) => {
            if (typeof filePath !== "string") {
                throw new Error("Path must be a string");
            }
            return path.basename(filePath, ext);
        }
    );

    ipcMain.handle("path:extname", (_event, filePath: string) => {
        if (typeof filePath !== "string") {
            throw new Error("Path must be a string");
        }
        return path.extname(filePath);
    });

    // ═══════════════════════════════════════════════════════════
    // APP HANDLERS
    // ═══════════════════════════════════════════════════════════

    ipcMain.handle("app:relaunch", () => {
        app.relaunch();
        app.exit(0);
    });

    ipcMain.handle("app:quit", () => {
        app.quit();
    });

    ipcMain.handle("app:getPath", (_event, name: string) => {
        const validPaths = [
            "home",
            "appData",
            "userData",
            "temp",
            "downloads",
            "documents",
            "desktop",
            "music",
            "pictures",
            "videos",
        ];

        if (!validPaths.includes(name)) {
            throw new Error(`Invalid path name: ${name}`);
        }

        return app.getPath(
            name as
                | "home"
                | "appData"
                | "userData"
                | "temp"
                | "downloads"
                | "documents"
                | "desktop"
                | "music"
                | "pictures"
                | "videos"
        );
    });

    ipcMain.handle("app:isPackaged", () => {
        return app.isPackaged;
    });

    ipcMain.handle("app:getVersion", () => {
        return app.getVersion();
    });

    // ═══════════════════════════════════════════════════════════
    // SHELL HANDLERS
    // ═══════════════════════════════════════════════════════════

    ipcMain.handle("shell:openExternal", async (_event, url: string) => {
        if (typeof url !== "string" || url.length === 0) {
            throw new Error("Invalid URL");
        }

        // Basic URL validation - only allow http, https, mailto
        const allowedProtocols = ["http:", "https:", "mailto:"];
        try {
            const parsedUrl = new URL(url);
            if (!allowedProtocols.includes(parsedUrl.protocol)) {
                throw new Error(`Protocol not allowed: ${parsedUrl.protocol}`);
            }
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error("Invalid URL format");
            }
            throw error;
        }

        await shell.openExternal(url);
    });

    ipcMain.handle("shell:openPath", async (_event, filePath: string) => {
        if (typeof filePath !== "string" || filePath.length === 0) {
            throw new Error("Invalid path");
        }

        return shell.openPath(filePath);
    });

    // ═══════════════════════════════════════════════════════════
    // CLIPBOARD HANDLERS
    // ═══════════════════════════════════════════════════════════

    ipcMain.handle("clipboard:writeText", (_event, text: string) => {
        if (typeof text !== "string") {
            throw new Error("Text must be a string");
        }
        clipboard.writeText(text);
    });

    ipcMain.handle("clipboard:readText", () => {
        return clipboard.readText();
    });

    // ═══════════════════════════════════════════════════════════
    // COOKIES HANDLERS
    // ═══════════════════════════════════════════════════════════

    ipcMain.handle("cookies:get", async (event, filter) => {
        // Use the session from the sender's webContents (respects partition)
        const ses = event.sender.session;
        return ses.cookies.get(filter || {});
    });

    ipcMain.handle("cookies:set", async (event, details) => {
        if (!details || typeof details !== "object") {
            throw new Error("Invalid cookie details");
        }
        // Use the session from the sender's webContents (respects partition)
        const ses = event.sender.session;
        await ses.cookies.set(details);
    });

    ipcMain.handle(
        "cookies:remove",
        async (event, url: string, name: string) => {
            if (
                typeof url !== "string" ||
                typeof name !== "string" ||
                url.length === 0 ||
                name.length === 0
            ) {
                throw new Error("Invalid URL or cookie name");
            }
            // Use the session from the sender's webContents (respects partition)
            const ses = event.sender.session;
            await ses.cookies.remove(url, name);
        }
    );
}

/**
 * Unregister all IPC handlers
 * Call this during cleanup if needed
 */
export function unregisterIpcHandlers(): void {
    const channels = [
        "window:minimize",
        "window:maximize",
        "window:unmaximize",
        "window:close",
        "window:show",
        "window:hide",
        "window:isMaximized",
        "window:setSize",
        "window:getSize",
        "dialog:showOpen",
        "dialog:showSave",
        "fs:readFile",
        "fs:writeFile",
        "fs:exists",
        "fs:mkdir",
        "fs:readdir",
        "fs:unlink",
        "fs:stat",
        "fs:rename",
        "path:join",
        "path:resolve",
        "path:dirname",
        "path:basename",
        "path:extname",
        "app:relaunch",
        "app:quit",
        "app:getPath",
        "app:isPackaged",
        "app:getVersion",
        "shell:openExternal",
        "shell:openPath",
        "clipboard:writeText",
        "clipboard:readText",
        "cookies:get",
        "cookies:set",
        "cookies:remove",
    ];

    channels.forEach((channel) => {
        ipcMain.removeHandler(channel);
    });
}
