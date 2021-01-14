import { useState } from "react";
import { TwitterPicker } from "react-color";

import store from "../utils/DataStore";
import { setThemeColor } from "../utils/setThemeColor";

export default function Settings(): JSX.Element {
    // const [textColor, setTextColor] = useState(
    //     getComputedStyle(document.documentElement)
    //         .getPropertyValue("--text_color_0")
    //         .trim()
    // );
    const [baseColor, setBaseColor] = useState(
        getComputedStyle(document.documentElement)
            .getPropertyValue("--theme_base_color")
            .trim()
    );
    // const [color0, setColor0] = useState(
    //     getComputedStyle(document.documentElement)
    //         .getPropertyValue("--theme_color_0")
    //         .trim()
    // );
    // const [color1, setColor1] = useState(
    //     getComputedStyle(document.documentElement)
    //         .getPropertyValue("--theme_color_1")
    //         .trim()
    // );
    // const [color2, setColor2] = useState(
    //     getComputedStyle(document.documentElement)
    //         .getPropertyValue("--theme_color_2")
    //         .trim()
    // );

    const [notification, setNotifications] = useState(
        store.get("settings.notifications") as boolean
    );

    const [directMessages, setDirectMessages] = useState(
        store.get("settings.directMessages") as boolean
    );

    const [sounds, setSounds] = useState(
        store.get("settings.sounds") as boolean
    );

    return (
        <div className="pane-screen-wrapper">
            <div className="message">
                <p className="message-header">App Settings</p>
                <div className="message-body">
                    <ul>
                        <li>
                            <label className="checkbox settings-box">
                                <input
                                    onChange={() => {
                                        store.set(
                                            "settings.notifications",
                                            !notification
                                        );
                                        setNotifications(!notification);
                                    }}
                                    type="checkbox"
                                    checked={notification}
                                />
                                &nbsp; Notifications
                            </label>
                        </li>
                        <li>
                            <label className="checkbox settings-box">
                                <input
                                    onChange={() => {
                                        store.set(
                                            "settings.directMessages",
                                            !directMessages
                                        );
                                        setDirectMessages(!directMessages);
                                    }}
                                    type="checkbox"
                                    checked={directMessages}
                                />
                                &nbsp; Direct Messages
                            </label>
                            <br />
                        </li>
                        <li>
                            <label className="checkbox settings-box">
                                <input
                                    onChange={() => {
                                        store.set("settings.sounds", !sounds);
                                        setSounds(!sounds);
                                    }}
                                    type="checkbox"
                                    checked={sounds}
                                />
                                &nbsp; Sounds
                            </label>
                        </li>
                    </ul>
                </div>
            </div>
            <br />
            <div className="message">
                <p className="message-header">Theme Settings</p>
                <div className="message-body">
                    <ul>
                        <li>
                            <label className="label is-small">
                                Theme color:
                            </label>
                            {/* <div className="tag" style={{
                                backgroundColor: baseColor,
                                color: textColor
                            }}>{baseColor}</div> */}
                            <TwitterPicker
                                triangle={"hide"}
                                colors={[
                                    "#0f0f0f",
                                    "#f5f5f5",
                                    "#400C0C",
                                    "#280e34",
                                    "#1C1D26",
                                ]}
                                color={baseColor}
                                onChange={(newBaseColor) => {
                                    setBaseColor(newBaseColor.hex);
                                    setThemeColor(newBaseColor.hex);
                                    store.set(
                                        "settings.themeColor",
                                        newBaseColor.hex
                                    );
                                }}
                            />
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
