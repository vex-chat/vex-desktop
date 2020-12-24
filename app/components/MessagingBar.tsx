import {
    faCheck,
    faCog,
    faFingerprint,
    faSearch,
    faSignOutAlt,
    faUserAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ISession, IUser } from "@vex-chat/vex-js";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import { selectSessions, stubSession } from "../reducers/sessions";
import { addFamiliar, selectFamiliars } from "../reducers/familiars";
import { selectInputStates, addInputState } from "../reducers/inputs";
import { selectUser } from "../reducers/user";
import { strToIcon } from "../utils/strToIcon";
import { IconUsername } from "./IconUsername";
import { switchFX } from "../views/Base";
import { routes } from "../constants/routes";

export const emptyUser: IUser = {
    userID: "",
    signKey: "",
    username: "",
    lastSeen: new Date(Date.now()),
};

export default function MessagingBar(): JSX.Element {
    const FORM_NAME = "dm-search-input";

    const user: IUser = useSelector(selectUser);
    const history = useHistory();
    const params: { userID: string } = useParams();
    const dispatch = useDispatch();

    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const sessions: Record<string, Record<string, ISession>> = useSelector(
        selectSessions
    );

    const newConversation = (user: IUser) => {
        switchFX.play();
        dispatch(addFamiliar(user));
        dispatch(stubSession(user.userID));

        history.push(routes.MESSAGING + "/" + user.userID);
    };

    return (
        <div className="sidebar">
            <div className="field search-wrapper">
                <div className="field">
                    <UserSearchBar
                        formName={FORM_NAME}
                        onSelectUser={(user: IUser) => {
                            newConversation(user);
                        }}
                    />
                </div>
            </div>

            <aside className="menu">
                <ul className="menu-list">
                    {FamiliarButton({
                        user: familiars[user.userID],
                        params,
                        subtitle: "Me",
                    })}

                    {Object.keys(sessions).map((userID) => {
                        if (familiars[userID] === undefined) {
                            return;
                        }

                        if (user.userID === userID) {
                            return;
                        }

                        return FamiliarButton({
                            user: familiars[userID],
                            params,
                            subtitle: "",
                        });
                    })}
                </ul>
            </aside>
        </div>
    );
}

type buttonProps = {
    user: IUser;
    params: { userID: string };
    subtitle: string;
};

function FamiliarButton({
    user,
    params,
    subtitle = "",
}: buttonProps): JSX.Element {
    if (!user) {
        return <div />;
    }

    return (
        <li
            className={`familiar-button${
                user.userID === params.userID ? " is-active" : ""
            }`}
            key={user.userID}
        >
            <Link to={routes.MESSAGING + "/" + user.userID}>
                {IconUsername(user, 48, undefined, subtitle)}
            </Link>
        </li>
    );
}

export function UserSearchBar(props: {
    formName: string;
    onSelectUser?: (user: IUser) => void;
    onFoundUser?: (user: IUser) => void;
}): JSX.Element {
    const [foundUser, setFoundUser] = useState(emptyUser);
    const dispatch = useDispatch();
    const inputs = useSelector(selectInputStates);

    return (
        <div className="control has-icons-left">
            <input
                className={`input has-icons-right is-grey is-small is-rounded search-bar${
                    foundUser.userID !== "" ? " is-success" : ""
                }`}
                type="text"
                placeholder="Search for user"
                value={inputs[props.formName] || ""}
                onKeyDown={async (event) => {
                    if (event.key === "Enter") {
                        if (foundUser.userID !== "") {
                            dispatch(addInputState(props.formName, ""));
                            setFoundUser(emptyUser);
                            if (props.onSelectUser) {
                                props.onSelectUser(foundUser);
                            }
                        }
                    } else {
                        if (props.onFoundUser) {
                            props.onFoundUser(emptyUser);
                        }
                        setFoundUser(emptyUser);
                    }
                }}
                onChange={async (event) => {
                    dispatch(addInputState(props.formName, event.target.value));
                    try {
                        if (event.target.value.length > 2) {
                            const client = window.vex;
                            const [
                                serverResults,
                                err,
                            ] = await client.users.retrieve(event.target.value);
                            if (
                                err &&
                                err.response &&
                                err.response.status === 404
                            ) {
                                setFoundUser(emptyUser);
                            }
                            if (serverResults) {
                                if (props.onFoundUser) {
                                    props.onFoundUser(serverResults);
                                }
                                setFoundUser(serverResults);
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }}
            />
            <span className="icon is-left">
                <FontAwesomeIcon
                    icon={foundUser === emptyUser ? faSearch : faCheck}
                />
            </span>
        </div>
    );
}

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
