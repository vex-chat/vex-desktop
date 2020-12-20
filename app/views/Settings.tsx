import React, { useState } from "react";
import { dataStore, VerticalAligner } from "./Base";
import { backButton } from "./Register";

export default function Settings(): JSX.Element {
    const [notification, setNotifications] = useState(
        dataStore.get("settings.notifications") as boolean
    );

    return (
        <VerticalAligner top={backButton()}>
            <div className="panel is-light">
                <p className="panel-heading">Settings</p>
                <div className="panel-block">
                    <label className="checkbox settings-box">
                        <input
                            onChange={() => {
                                dataStore.set(
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
