import type { IUser } from "@vex-chat/libvex";

import { faMobileAlt, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router-dom";

import { routes } from "../constants/routes";

export function FamiliarMenu(props: {
    familiar: IUser;
    trigger: JSX.Element;
    up?: boolean;
}): JSX.Element {
    const [active, setActive] = useState(false);

    const outsideClick = () => {
        setActive(false);
        window.removeEventListener("click", outsideClick);
    };

    return (
        <div
            className={`dropdown ${active ? "is-active" : ""} ${
                props.up ? "is-up" : ""
            }`}
        >
            <div
                className="dropdown-trigger pointer"
                onClick={(event) => {
                    event.stopPropagation();
                    if (!active) {
                        setActive(true);
                        window.addEventListener("click", outsideClick);
                    } else {
                        setActive(false);
                        window.removeEventListener("click", outsideClick);
                    }
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
                            "/devices"
                        }
                        className="dropdown-item"
                        onClick={() => {
                            setActive(false);
                        }}
                    >
                        <FontAwesomeIcon icon={faMobileAlt} />
                        &nbsp; User Devices
                    </Link>
                </div>
            </div>
        </div>
    );
}
