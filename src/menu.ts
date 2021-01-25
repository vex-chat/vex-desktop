import type { BrowserWindow, MenuItemConstructorOptions } from "electron";

import { app, Menu, shell } from "electron";

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
    selector?: string;
    submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}
export default class MenuBuilder {
    mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow;
    }

    buildMenu(trayMenu = false, set = true): Menu {
        this.setupDevelopmentEnvironment();

        const showApp = {
            label: "Show App",
            click: () => {
                if (this.mainWindow) {
                    this.mainWindow.show();
                    this.mainWindow.focus();
                }
            },
        };

        const quitApp = {
            label: "Quit",
            click: () => {
                app.exit();
            },
        };

        const template =
            process.platform === "darwin"
                ? this.buildDarwinTemplate()
                : this.buildDefaultTemplate();

        const menu = Menu.buildFromTemplate(
            trayMenu ? [showApp, quitApp, ...template] : template
        );
        if (set) {
            Menu.setApplicationMenu(menu);
        }

        return menu;
    }

    sendLogout(): void {
        this.mainWindow.webContents.send("relaunch");
    }

    setupDevelopmentEnvironment(): void {
        this.mainWindow.webContents.on("context-menu", (_, props) => {
            const { x, y } = props;

            Menu.buildFromTemplate([
                {
                    label: "Inspect element",
                    click: () => {
                        this.mainWindow.webContents.inspectElement(x, y);
                    },
                },
            ]).popup({ window: this.mainWindow });
        });
    }

    buildDarwinTemplate(): MenuItemConstructorOptions[] {
        const subMenuAbout: DarwinMenuItemConstructorOptions = {
            label: "Vex Desktop",
            submenu: [
                {
                    label: "About Vex Desktop",
                    selector: "orderFrontStandardAboutPanel:",
                },
                { type: "separator" },
                { label: "Services", submenu: [] },
                { type: "separator" },
                {
                    label: "Hide Vex Desktop",
                    accelerator: "Command+H",
                    selector: "hide:",
                },
                {
                    label: "Hide Others",
                    accelerator: "Command+Shift+H",
                    selector: "hideOtherApplications:",
                },
                { label: "Show All", selector: "unhideAllApplications:" },
                { type: "separator" },
                {
                    label: "Logout",
                    accelerator: "Command+F12",
                    click: this.sendLogout.bind(this),
                },
                {
                    label: "Quit",
                    accelerator: "Command+Q",
                    click: () => {
                        app.quit();
                    },
                },
                {
                    label: "Privacy Policy",
                    click: () => {
                        shell.openExternal("https://vex.chat/privacy-policy");
                    },
                },
            ],
        };
        const subMenuEdit: DarwinMenuItemConstructorOptions = {
            label: "Edit",
            submenu: [
                { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
                {
                    label: "Redo",
                    accelerator: "Shift+Command+Z",
                    selector: "redo:",
                },
                { type: "separator" },
                { label: "Cut", accelerator: "Command+X", selector: "cut:" },
                { label: "Copy", accelerator: "Command+C", selector: "copy:" },
                {
                    label: "Paste",
                    accelerator: "Command+V",
                    selector: "paste:",
                },
                {
                    label: "Select All",
                    accelerator: "Command+A",
                    selector: "selectAll:",
                },
            ],
        };
        const subMenuViewDev: MenuItemConstructorOptions = {
            label: "View",
            submenu: [
                {
                    label: "Reload",
                    accelerator: "Command+R",
                    click: () => {
                        this.mainWindow.webContents.reload();
                    },
                },
                {
                    label: "Toggle Full Screen",
                    accelerator: "Ctrl+Command+F",
                    click: () => {
                        this.mainWindow.setFullScreen(
                            !this.mainWindow.isFullScreen()
                        );
                    },
                },
                {
                    label: "Toggle Developer Tools",
                    accelerator: "Alt+Command+I",
                    click: () => {
                        this.mainWindow.webContents.toggleDevTools();
                    },
                },
            ],
        };
        const subMenuWindow: DarwinMenuItemConstructorOptions = {
            label: "Window",
            submenu: [
                {
                    label: "Minimize",
                    accelerator: "Command+M",
                    selector: "performMiniaturize:",
                },
                {
                    label: "Close",
                    accelerator: "Command+W",
                    selector: "performClose:",
                },
                { type: "separator" },
                { label: "Bring All to Front", selector: "arrangeInFront:" },
            ],
        };

        const subMenuHelp: MenuItemConstructorOptions = {
            label: "Help",
            submenu: [
                {
                    label: "Learn More",
                    click() {
                        void shell.openExternal("https://vex.chat");
                    },
                },
            ],
        };

        const subMenuView = subMenuViewDev;

        return [
            subMenuAbout,
            subMenuEdit,
            subMenuView,
            subMenuWindow,
            subMenuHelp,
        ];
    }

    buildDefaultTemplate(): MenuItemConstructorOptions[] {
        const templateDefault = [
            {
                label: "&File",
                submenu: [
                    {
                        label: "&Open",
                        accelerator: "Ctrl+O",
                    },
                    {
                        label: "&Close",
                        accelerator: "Ctrl+W",
                        click: () => {
                            this.mainWindow.close();
                        },
                    },
                    {
                        label: "Logout",
                        accelerator: "Ctrl+F12",
                        click: this.sendLogout.bind(this),
                    },
                ],
            },
            {
                label: "&View",
                submenu: [
                    {
                        label: "&Reload",
                        accelerator: "Ctrl+R",
                        click: () => {
                            this.mainWindow.webContents.reload();
                        },
                    },
                    {
                        label: "Toggle &Full Screen",
                        accelerator: "F11",
                        click: () => {
                            this.mainWindow.setFullScreen(
                                !this.mainWindow.isFullScreen()
                            );
                        },
                    },
                    {
                        label: "Toggle &Developer Tools",
                        accelerator: "Alt+Ctrl+I",
                        click: () => {
                            this.mainWindow.webContents.toggleDevTools();
                        },
                    },
                ],
            },
            {
                label: "Information",
                submenu: [
                    {
                        label: "Learn More",
                        click: () => {
                            void shell.openExternal("https://vex.chat");
                        },
                    },
                    {
                        label: "Privacy Policy",
                        click: () => {
                            shell.openExternal(
                                "https://vex.chat/privacy-policy"
                            );
                        },
                    },
                ],
            },
        ];

        return templateDefault;
    }
}
