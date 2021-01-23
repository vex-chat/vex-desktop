import type { IUser } from "@vex-chat/libvex";

import {
    faBan,
    faCog,
    faMobileAlt,
    faShoePrints,
    faUserAlt,
    faUserEdit,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";

import { routes } from "../constants/routes";
import { selectUser } from "../reducers/user";

export function FamiliarMenu(props: {
    familiar: IUser;
    trigger: JSX.Element;
    up?: boolean;
}): JSX.Element {
    const history = useHistory();
    const [active, setActive] = useState(false);
    const params: { channelID?: string; serverID?: string } = useParams();
    const user = useSelector(selectUser);
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
                        <span className="icon">
                            <FontAwesomeIcon icon={faUserAlt} />
                        </span>
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
                        <span className="icon">
                            <FontAwesomeIcon icon={faMobileAlt} />
                        </span>
                        &nbsp; User Devices
                    </Link>
                    {params.serverID && props.familiar.userID !== user.userID && (
                        <Link
                            to={history.location.pathname}
                            className="dropdown-item has-text-danger"
                            onClick={(event) => {
                                event.preventDefault();
                                setActive(false);
                            }}
                        >
                            <span className="icon">
                                <FontAwesomeIcon
                                    icon={faBan}
                                    className="has-text-danger"
                                />
                            </span>
                            &nbsp; Kick User
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

// onClick={async () => {
//     setActive(false);
//     const client = window.vex;
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     await client.moderation.kick(
//         props.familiar.userID,
//         // the compiler is stupid, this is unreachable if !serverID
//         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//         params.serverID!
//     );
// }}
