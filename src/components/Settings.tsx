import { remote } from "electron";
import fs from "fs";
import { useState } from "react";
import { TwitterPicker } from "react-color";
import { useDispatch, useSelector } from "react-redux";

import { set as setAvatarHash } from "../reducers/avatarHash";
import { selectUser } from "../reducers/user";
import store from "../utils/DataStore";
import { setThemeColor } from "../utils/setThemeColor";

import { IconUsername } from "./IconUsername";
import Loading from "./Loading";

export default function Settings(): JSX.Element {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [baseColor, setBaseColor] = useState(
        getComputedStyle(document.documentElement)
            .getPropertyValue("--theme_base_color")
            .trim()
    );

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
                <p className="message-header">User Settings</p>
                <div className="message-body has-text-left">
                    <span
                        onClick={async () => {
                            const dialogRes = await remote.dialog.showOpenDialog(
                                remote.getCurrentWindow(),
                                {
                                    title: "Select an avatar",
                                }
                            );

                            const { canceled, filePaths } = dialogRes;
                            if (canceled) {
                                return;
                            }

                            const [path] = filePaths;
                            if (path) {
                                setUploadingAvatar(true);
                                fs.readFile(path, async (err, buf) => {
                                    if (err) {
                                        setUploadingAvatar(false);
                                        return;
                                    }
                                    const client = window.vex;
                                    await client.me.setAvatar(buf);
                                    setUploadingAvatar(false);
                                    dispatch(setAvatarHash());
                                });
                            }
                        }}
                    >
                        {!uploadingAvatar &&
                            IconUsername(
                                user,
                                48,
                                undefined,
                                "",
                                "avatar-trigger pointer"
                            )}
                        {uploadingAvatar && (
                            <span className="columns">
                                <span className="column is-narrow">
                                    <Loading
                                        className={"avatar-loader"}
                                        animation={"spinningBubbles"}
                                        size={42}
                                    />
                                </span>
                                <span className="column is-narrow avatar-loader-text">
                                    Uploading, please wait.
                                </span>
                            </span>
                        )}
                    </span>
                </div>
            </div>
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
