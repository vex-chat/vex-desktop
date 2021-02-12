import { faTimes, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";
import { remote } from "electron";
import { Fragment } from "react";

import closeWindowIcon from "../../assets/windowIcons/light-compact/button_close.svg";
import maximizeWindowIcon from "../../assets/windowIcons/light-compact/button_maximize.svg";
import minimizeWindowIcon from "../../assets/windowIcons/light-compact/button_minimize.svg";

export function TitleBar(): JSX.Element {
    function closeWindow() {
        const window = remote.getCurrentWindow();
        window.hide();
    }

    function maximizeWindow() {
        const window = remote.getCurrentWindow();

        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    }

    function minimizeWindow() {
        remote.getCurrentWindow().minimize();
    }

    return (
        <header id="titlebar">
            <div id="drag-region">
                <div className="no-drag" id="window-controls">
                    <div
                        className="window-button pointer"
                        id="min-button"
                        onClick={minimizeWindow}
                    >
                        <img src={minimizeWindowIcon} />
                    </div>

                    <div
                        className="window-button pointer"
                        id="max-button"
                        onClick={maximizeWindow}
                    >
                        <img src={maximizeWindowIcon} />
                    </div>

                    <div
                        className="window-button pointer"
                        id="close-button"
                        onClick={closeWindow}
                    >
                        <img src={closeWindowIcon} />
                    </div>
                </div>
            </div>
        </header>
    );
}
