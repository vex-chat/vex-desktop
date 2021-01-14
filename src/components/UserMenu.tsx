import {
    faCog,
    faSignOutAlt,
    faUserAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
                    <figure className="user-icon image is-32x32">
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
                                <div className="image">
                                    <Avatar user={user} size={32} />
                                </div>
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
                                        <FontAwesomeIcon icon={faCog} />
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
                                        <FontAwesomeIcon icon={faUserAlt} />
                                        &nbsp; My Info
                                    </Link>
                                    <Link
                                        to={routes.LOGOUT}
                                        className="dropdown-item has-text-danger"
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        &nbsp; Logout
                                    </Link>
                                </div>
                            </div>
                        </span>
                    </figure>
                </div>

                <div className="column">
                    <span className="help">{user.username}</span>
                </div>
            </div>
        </div>
    );
}
