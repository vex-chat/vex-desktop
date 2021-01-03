/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, shell } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import path from "path";

import MenuBuilder from "./menu";

export default class AppUpdater {
    constructor() {
        log.transports.file.level = "info";
        autoUpdater.logger = log;
        void autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line  @typescript-eslint/no-var-requires
    const sourceMapSupport = require("source-map-support");
    sourceMapSupport.install();
}

if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
) {
    // eslint-disable-next-line  @typescript-eslint/no-var-requires
    require("electron-debug")();
}

const createWindow = async () => {
    const RESOURCES_PATH = app.isPackaged
        ? path.join(process.resourcesPath, "resources")
        : path.join(__dirname, "../resources");

    const getAssetPath = (...paths: string[]): string => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
        titleBarStyle: "hidden",
        frame: false,
        show: false,
        width: 1200,
        height: 900,
        icon: getAssetPath("icon.png"),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
    });

    // DEFINE EVENT HANDLERS BEFORE LOADING THE APP

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on("did-finish-load", () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }

        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    // Open urls in the user's browser
    mainWindow.webContents.on("new-window", (event, url) => {
        event.preventDefault();
        void shell.openExternal(url);
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    await mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Remove this if your app does not use auto updates
    new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.whenReady().then(createWindow).catch(console.log);

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        void createWindow();
    }
});
