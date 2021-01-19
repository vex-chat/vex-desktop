/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import { sleep } from "@extrahash/sleep";
import { app, BrowserWindow, shell, Tray } from "electron";
import isDev from "electron-is-dev";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import path from "path";

import MenuBuilder from "./menu";

    
const singleLock = app.requestSingleInstanceLock()
let mainWindow: BrowserWindow | null = null;

if (!singleLock) {
    app.quit()
} else {
    app.on('second-instance', (_event, argv) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }

        for (const arg of argv) {
            if (arg.includes("vex://")) {
                mainWindow?.webContents.send("open-url", { url: arg });
            }
        }
    })
}

if (!isDev) {
    app.setAsDefaultProtocolClient("vex");
}


const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../assets");

export const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
};

log.transports.file.level = "info";
autoUpdater.logger = log;

log.info("App starting...");

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
    mainWindow = new BrowserWindow({
        titleBarStyle: "hidden",
        frame: false,
        show: false,
        width: 1449,
        height: 900,
        icon: getAssetPath("icon.png"),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
    });

    // DEFINE EVENT HANDLERS BEFORE LOADING THE APP


    // AUTO UPDATER EVENTS
    autoUpdater.on("checking-for-update", () => {
        mainWindow?.webContents.send("autoUpdater", { status: "checking" });
    });
    autoUpdater.on("update-available", () => {
        mainWindow?.webContents.send("autoUpdater", { status: "available" });
    });
    autoUpdater.on("update-not-available", () => {
        mainWindow?.webContents.send("autoUpdater", { status: "current" });
    });
    autoUpdater.on("error", (err) => {
        mainWindow?.webContents.send("autoUpdater", {
            status: "error",
            message: err.toString(),
        });
    });

    type UpdateDownloadProgress = {
        bytesPerSecond: number;
        percent: number;
        transferred: number;
        total: number;
    };

    autoUpdater.on(
        "download-progress",
        (progressObj: UpdateDownloadProgress) => {
            mainWindow?.webContents.send("autoUpdater", {
                status: "progress",
                data: progressObj,
            });
        }
    );
    autoUpdater.on("update-downloaded", () => {
        mainWindow?.webContents.send("autoUpdater", { status: "downloaded" });
        autoUpdater.quitAndInstall(true, true);
    });

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

let tray;
app.on("ready", async () => {
    log.info("App is ready.");
    tray = new Tray(getAssetPath("icon.iconset/icon_16x16@2x.png"));
    while (!mainWindow) {
        await sleep(100);
    }
    const menuBuilder = new MenuBuilder(mainWindow);
    const menu = menuBuilder.buildMenu(false);
    tray.setContextMenu(menu);
    log.info("Created context menu.");
    autoUpdater.checkForUpdatesAndNotify();
});

app.on("open-url", async (_event, url) => {
    // in case user hasn't opened app yet
    while (!mainWindow) {
        await sleep(100);
    }
    mainWindow.webContents.send("open-url", { url });
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        void createWindow();
    }
});
