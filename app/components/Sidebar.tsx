import {
    faArrowAltCircleRight,
    faCog,
    faEye,
    faFingerprint,
    faSearch,
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
import { client } from "./ClientLauncher";

const emptyUser: IUser = {
    userID: "",
    signKey: "",
    username: "",
    lastSeen: new Date(Date.now()),
};

export default function Sidebar(): JSX.Element {
    const user: IUser = useSelector(selectUser);
    const history = useHistory();
    const params: { userID: string } = useParams();

    const dispatch = useDispatch();
    const inputs = useSelector(selectInputStates);

    const [className, setClassName] = useState("");

    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const sessions: Record<string, Record<string, ISession>> = useSelector(
        selectSessions
    );

    const [foundUser, setFoundUser] = useState(emptyUser);

    const newConversation = (user: IUser) => {
        switchFX.play();
        dispatch(addFamiliar(user));
        dispatch(addInputState("search-bar", ""));
        dispatch(stubSession(user.userID));

        history.push(routes.MESSAGING + "/" + user.userID);
    };

    return (
        <div className="sidebar">
            <div className="field has-addons search-wrapper">
                <figure className="user-icon image is-32x32">
                    {user.userID !== "" && (
                        <div className={`dropdown ${className}`}>
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
                                <div className="dropdown-content">
                                    <div className="dropdown-item">
                                        {IconUsername(user, 48, "")}
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
                                        to={routes.REGISTER}
                                        className="dropdown-item has-text-danger"
                                        onClick={async () => {
                                            dispatch(
                                                addInputState(
                                                    "own-user-icon-dropdown",
                                                    ""
                                                )
                                            );
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faFingerprint} />
                                        &nbsp; New Identity
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </figure>

                <div className="field">
                    <p
                        className={`control has-icons-left${
                            foundUser.userID !== "" ? " has-icons-right" : ""
                        }`}
                    >
                        <input
                            className={`input is-grey is-small is-rounded search-bar${
                                foundUser.userID !== "" ? " is-success" : ""
                            }`}
                            type="text"
                            placeholder="Search"
                            value={inputs["search-bar"] || ""}
                            onKeyDown={async (event) => {
                                if (event.key === "Enter") {
                                    if (foundUser.userID !== "") {
                                        newConversation(foundUser);
                                        setFoundUser(emptyUser);
                                    }
                                } else {
                                    setFoundUser(emptyUser);
                                }
                            }}
                            onChange={async (event) => {
                                dispatch(
                                    addInputState(
                                        "search-bar",
                                        event.target.value
                                    )
                                );

                                const results: Record<string, IUser> = {};

                                try {
                                    if (event.target.value.length > 2) {
                                        for (const userID in familiars) {
                                            if (
                                                familiars[userID].username
                                                    .trim()
                                                    .toLowerCase()
                                                    .includes(
                                                        event.target.value.toLowerCase()
                                                    )
                                            ) {
                                                results[userID] =
                                                    familiars[userID];
                                            }
                                        }

                                        const serverResults = await client.users.retrieve(
                                            event.target.value
                                        );
                                        if (serverResults) {
                                            setFoundUser(serverResults);
                                        } else {
                                            setFoundUser(emptyUser);
                                        }
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                        />

                        <span className="icon is-small is-left">
                            <FontAwesomeIcon
                                className={`is-left`}
                                icon={
                                    foundUser.userID !== "" ? faEye : faSearch
                                }
                            />
                        </span>
                        {foundUser.userID !== "" && (
                            <span className="icon is-small is-right has-text-success">
                                <FontAwesomeIcon
                                    className="is-right"
                                    icon={faArrowAltCircleRight}
                                />
                            </span>
                        )}
                    </p>
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
                {IconUsername(user, 48, subtitle)}
            </Link>
        </li>
    );
}
