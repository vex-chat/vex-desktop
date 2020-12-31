import { faFingerprint, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IUser } from "@vex-chat/libvex";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../constants/routes";

export function FamiliarMenu(props: {
    familiar: IUser;
    trigger: JSX.Element;
}): JSX.Element {
    const [active, setActive] = useState(false);

    return (
        <div className={`dropdown ${active ? "is-active" : ""}`}>
            <div
                className="dropdown-trigger pointer"
                onClick={() => {
                    setActive(!active);
                }}
            >
                {props.trigger}
            </div>
            <div className="dropdown-menu" id="dropdown-menu2" role="menu">
                <div className="dropdown-content">
                    <Link
                        to={
                            routes.MESSAGING +
                            "/" +
                            props.familiar.userID +
                            "/info"
                        }
                        className="dropdown-item"
                        onClick={() => {
                            setActive(false);
                        }}
                    >
                        <FontAwesomeIcon icon={faUserAlt} />
                        &nbsp; User Info
                    </Link>
                    <Link
                        to={
                            routes.MESSAGING +
                            "/" +
                            props.familiar.userID +
                            "/verify"
                        }
                        className="dropdown-item"
                        onClick={() => {
                            setActive(false);
                        }}
                    >
                        <FontAwesomeIcon icon={faFingerprint} />
                        &nbsp; User Sessions
                    </Link>
                </div>
            </div>
        </div>
    );
}
