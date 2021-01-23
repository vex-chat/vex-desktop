import { remote } from "electron";
import fs from "fs";
import { Fragment, useEffect, useState } from "react";
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

    useEffect(() => {
        // this is to hide the unwanted # before color input tag
        // there might be a better solution
        const colorPicker = document.getElementsByClassName("twitter-picker");
        if (colorPicker.length == 0) {
            return;
        }
        const children = colorPicker[0].children;

        for (let i = 0; i < children.length; i++) {
            for (let j = 0; j < children[i].children.length; j++) {
                if (children[i].children[j].textContent == "#") {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (children[i].children[j] as any).style.display = "none";
                }
            }
        }
    });

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

    const [mentionNotifications, setMentionNotifications] = useState(
        store.get("settings.notify.mentions") as boolean
    );

    const [errText, setErrText] = useState("");

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
                                    filters: [
                                        {
                                            name: "Images",
                                            extensions: [
                                                "jpg",
                                                "jpeg",
                                                "png",
                                                "gif",
                                                "apng",
                                                "avif",
                                                "svg",
                                            ],
                                        },
                                    ],
                                }
                            );

                            const { canceled, filePaths } = dialogRes;
                            if (canceled) {
                                return;
                            }

                            setErrText("");

                            const [path] = filePaths;
                            if (path) {
                                setUploadingAvatar(true);
                                fs.readFile(path, async (err, buf) => {
                                    if (buf.byteLength > 5000000) {
                                        setUploadingAvatar(false);
                                        setErrText("File too big (max 5mb)");
                                        return;
                                    }

                                    if (err) {
                                        setUploadingAvatar(false);
                                        return;
                                    }
                                    const client = window.vex;
                                    try {
                                        await client.me.setAvatar(buf);
                                    } catch (err) {
                                        setErrText(
                                            err.response?.data?.error ||
                                                err.toString()
                                        );
                                    }

                                    setUploadingAvatar(false);
                                    dispatch(setAvatarHash());
                                });
                            }
                        }}
                    >
                        <span className="columns">
                            {!uploadingAvatar &&
                                IconUsername(
                                    user,
                                    48,
                                    undefined,
                                    "",
                                    "avatar-trigger pointer"
                                )}
                            {uploadingAvatar && (
                                <Fragment>
                                    <span className="column is-narrow">
                                        <Loading
                                            className={"avatar-loader"}
                                            animation={"spinningBubbles"}
                                            size={16}
                                        />
                                    </span>
                                    <span className="column is-narrow avatar-loader-text">
                                        Uploading, please wait.
                                    </span>
                                </Fragment>
                            )}
                            {errText !== "" && (
                                <span className="column is-narrow">
                                    <span className="has-text-danger">
                                        {errText}
                                    </span>
                                </span>
                            )}
                        </span>
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
                                    "#ffffff",
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

            <div className="message">
                <p className="message-header">Notification Settings</p>
                <div className="message-body">
                    <ul>
                        <li>
                            <label className="checkbox settings-box">
                                <input
                                    onChange={() => {
                                        if (!notification) {
                                            store.set(
                                                "settings.notify.mentions",
                                                true
                                            );
                                            setMentionNotifications(true);
                                        }

                                        store.set(
                                            "settings.notifications",
                                            !notification
                                        );
                                        setNotifications(!notification);
                                    }}
                                    type="checkbox"
                                    checked={notification}
                                />
                                &nbsp; Global (all messages)
                            </label>
                        </li>
                        <li>
                            <label className="checkbox settings-box">
                                <input
                                    disabled={notification}
                                    onChange={() => {
                                        store.set(
                                            "settings.notify.mentions",
                                            !mentionNotifications
                                        );
                                        setMentionNotifications(
                                            !mentionNotifications
                                        );
                                    }}
                                    type="checkbox"
                                    checked={mentionNotifications}
                                />
                                &nbsp; Mentions
                            </label>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
