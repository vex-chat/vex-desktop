import React, { useState } from "react";
import { BackButton } from "../components/BackButton";
import { VerticalAligner } from "../components/VerticalAligner";
import store from "../utils/DataStore";

export default function Settings(): JSX.Element {
    const [notification, setNotifications] = useState(
        store.get("settings.notifications") as boolean
    );

    return (
        <VerticalAligner top={<BackButton />}>
            <div className="panel is-light">
                <p className="panel-heading">Settings</p>
                <div className="panel-block">
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
                </div>
            </div>
        </VerticalAligner>
    );
}
