import {
    faCog,
    faUserAlt,
    faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { routes } from "../constants/routes";
import { addInputState } from "../reducers/inputs";
import { selectUser } from "../reducers/user";
import { strToIcon } from "../utils/strToIcon";
import { IconUsername } from "./IconUsername";

export function UserMenu(): JSX.Element {
    const user = useSelector(selectUser);
    const [className, setClassName] = useState("");
    const dispatch = useDispatch();

    return (
        <div className="user-menu-wrapper">
            <div className="columns">
                <div className="column is-narrow">
                    <figure className="user-icon image is-32x32">
                        <span className={`dropdown is-up ${className}`}>
                            <div
                                className="dropdown-trigger pointer"
                                onClick={() => {
                                    if (className == "") {
                                        setClassName("is-active");
                                    } else {
                                        setClassName("");
                                    }
                                }}
                            >
                                <img
                                    className="is-rounded"
                                    src={strToIcon(
                                        user.username || "".slice(0, 2)
                                    )}
                                />
                            </div>

                            <div
                                className="dropdown-menu"
                                id="dropdown-menu2"
                                role="menu"
                            >
                                <div className="dropdown-content user-dropdown">
                                    <div className="dropdown-item">
                                        {IconUsername(user, 48, undefined, "")}
                                    </div>
                                    <Link
                                        to={routes.SETTINGS}
                                        className="dropdown-item"
                                        onClick={() => {
                                            dispatch(
                                                addInputState(
                                                    "own-user-icon-dropdown",
                                                    ""
                                                )
                                            );
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
                                        onClick={async () => {
                                            setClassName("");
                                            dispatch(
                                                addInputState(
                                                    "own-user-icon-dropdown",
                                                    ""
                                                )
                                            );
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
