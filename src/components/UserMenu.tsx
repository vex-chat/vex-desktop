import {
    Settings as SettingsIcon,
    Smartphone as SmartphoneIcon,
    LogOut as LogOutIcon,
    User as UserIcon,
} from "react-feather";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { routes } from "../constants/routes";
import { selectUser } from "../reducers/user";

import Avatar from "./Avatar";
import { IconUsername } from "./IconUsername";

export function UserMenu(): JSX.Element {
    const user = useSelector(selectUser);

    const [className, setClassName] = useState("");

    const outsideClick = () => {
        setClassName("");
    };

    return (
        <div className="user-menu-wrapper">
            <div className="columns">
                <div className="column is-narrow">
                    <span className={`dropdown is-up ${className}`}>
                        <div
                            className="dropdown-trigger pointer"
                            onClick={(event) => {
                                event.stopPropagation();
                                if (className == "") {
                                    setClassName("is-active");
                                    window.addEventListener(
                                        "click",
                                        outsideClick
                                    );
                                } else {
                                    setClassName("");
                                    window.removeEventListener(
                                        "click",
                                        outsideClick
                                    );
                                }
                            }}
                        >
                            <Avatar user={user} size={32} />
                        </div>

                        <div
                            className="dropdown-menu"
                            id="dropdown-menu2"
                            role="menu"
                        >
                            <div className="dropdown-content user-dropdown">
                                <div className="dropdown-item no-hover">
                                    {IconUsername(user, 48, undefined, "")}
                                </div>
                                <Link
                                    to={
                                        routes.MESSAGING +
                                        "/" +
                                        user.userID +
                                        "/settings"
                                    }
                                    className="dropdown-item"
                                    onClick={() => {
                                        setClassName("");
                                    }}
                                >
                                    <span className="icon">
                                        <SettingsIcon size={14} />
                                    </span>
                                    &nbsp; Preferences
                                </Link>
                                <Link
                                    to={
                                        routes.MESSAGING +
                                        "/" +
                                        user.userID +
                                        "/info"
                                    }
                                    className="dropdown-item"
                                    onClick={() => {
                                        setClassName("");
                                    }}
                                >
                                    <span className="icon">
                                        <UserIcon size={14} />
                                    </span>
                                    &nbsp; My Info
                                </Link>
                                <Link
                                    to={
                                        routes.MESSAGING +
                                        "/" +
                                        user.userID +
                                        "/devices"
                                    }
                                    className="dropdown-item"
                                    onClick={() => {
                                        setClassName("");
                                    }}
                                >
                                    <span className="icon">
                                        <SmartphoneIcon size={14} />
                                    </span>
                                    &nbsp; My Devices
                                </Link>
                                <Link
                                    to={routes.LOGOUT}
                                    className="dropdown-item has-text-danger"
                                >
                                    <span className="icon has-text-danger">
                                        <LogOutIcon size={14} />
                                    </span>
                                    &nbsp; Logout
                                </Link>
                            </div>
                        </div>
                    </span>
                </div>
                <div className="column is-narrow">
                    <span className="is-size-5">{user.username}</span>
                </div>
            </div>
        </div>
    );
}
