import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { selectSettings, setSettings } from "../reducers/settings";
import { VerticalAligner } from "./Base";
import { backButton } from "./Register";

export default function Settings(): JSX.Element {
    const history = useHistory();
    const settings = useSelector(selectSettings);
    const dispatch = useDispatch();

    return (
        <VerticalAligner top={backButton()}>
            <div className="panel is-light">
                <p className="panel-heading">Settings</p>
                <div className="panel-block">
                    <label className="checkbox settings-box">
                        <input
                            onChange={() => {
                                dispatch(
                                    setSettings({
                                        key: "notifications",
                                        value: !settings.notifications,
                                    })
                                );
                            }}
                            type="checkbox"
                            checked={settings.notifications as boolean}
                        />
                        &nbsp; Notifications
                    </label>
                </div>
            </div>
        </VerticalAligner>
    );
}
