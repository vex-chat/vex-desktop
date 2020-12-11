import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { selectSettings, setSettings } from "../reducers/settings";

export default function Settings(): JSX.Element {
    const history = useHistory();
    const settings = useSelector(selectSettings);
    const dispatch = useDispatch();

    return (
        <div className="Aligner full-size">
            <div className="Aligner-item Aligner-item--top">
                <a
                    className="delete settings-delete is-large"
                    onClick={() => {
                        history.goBack();
                    }}
                ></a>
            </div>
            <div className="Aligner-item">
                <div className="has-background-white box">
                    <label className="label is-large">Settings</label>
                    <ul>
                        <li>
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
                        </li>
                    </ul>
                </div>
            </div>
            <div className="Aligner-item Aligner-item--bottom"></div>
        </div>
    );
}
