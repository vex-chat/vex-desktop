import {
    faTimes,
    faWindowMaximize,
    faWindowMinimize,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { remote } from "electron";
import React from "react";

import pjson from "../package.json";

export function TitleBar(): JSX.Element {
    function closeWindow() {
        const window = remote.getCurrentWindow();
        window.close();
    }

    function maximizeWindow() {
        const window = remote.getCurrentWindow();

        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    }

    return (
        <div className="title-bar" onDoubleClick={maximizeWindow}>
            <div className="title-bar-grabber has-text-centered is-size-7">
                vex desktop {pjson.version}
            </div>
            {process.platform !== "darwin" && (
                <div className="window-buttons">
                    <span
                        onClick={() => {
                            remote.getCurrentWindow().minimize();
                        }}
                        className="pointer icon is-small minimize-button "
                    >
                        <FontAwesomeIcon icon={faWindowMinimize} />
                    </span>
                    <span
                        onClick={maximizeWindow}
                        className="icon maximize-button is-small pointer"
                    >
                        <FontAwesomeIcon icon={faWindowMaximize} />
                    </span>
                    <span
                        onClick={closeWindow}
                        className="icon close-button has-text-danger is-small pointer"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </div>
            )}
        </div>
    );
}
