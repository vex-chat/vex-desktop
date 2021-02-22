import type { IUser } from "@vex-chat/libvex";

import {
    Slash as SlashIcon,
    Smartphone as SmartphoneIcon,
    User as UserIcon,
} from "react-feather";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";

import { routes } from "../constants/routes";
import { set as setOnlineList } from "../reducers/onlineLists";
import { selectUser } from "../reducers/user";

export function FamiliarMenu(props: {
    familiar: IUser;
    trigger: JSX.Element;
    up?: boolean;
}): JSX.Element {
    const history = useHistory();
    const dispatch = useDispatch();
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
                            <UserIcon size={14} />
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
                            <SmartphoneIcon size={14} />
                        </span>
                        &nbsp; User Devices
                    </Link>
                    {params.serverID && props.familiar.userID !== user.userID && (
                        <Link
                            to={history.location.pathname}
                            className="dropdown-item has-text-danger"
                            onClick={async (event) => {
                                if (!params.serverID) {
                                    return;
                                }

                                event.preventDefault();
                                setActive(false);

                                const client = window.vex;
                                try {
                                    await client.moderation.kick(
                                        props.familiar.userID,
                                        params.serverID
                                    );
                                    if (params.channelID) {
                                        const userList = await client.channels.userList(
                                            params.channelID
                                        );
                                        dispatch(
                                            setOnlineList({
                                                channelID: params.channelID,
                                                userList,
                                            })
                                        );
                                    }
                                } catch (err) {
                                    console.warn(err);
                                }
                            }}
                        >
                            <span className="icon">
                                <SlashIcon />
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
