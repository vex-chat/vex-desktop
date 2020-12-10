import {
    faCog,
    faFingerprint,
    faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IUser } from "@vex-chat/vex-js";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import {
    addConversation,
    resetConversations,
    selectConversations,
} from "../reducers/conversations";
import {
    addFamiliar,
    resetFamiliars,
    selectFamiliars,
} from "../reducers/familiars";
import {
    selectInputStates,
    addInputState,
    resetInputStates,
} from "../reducers/inputs";
import { resetUser, selectUser } from "../reducers/user";
import { strToIcon } from "../utils/strToIcon";
import { IconUsername } from "./IconUsername";
import { client } from "../views/Base";
import { routes } from "../constants/routes";
import { resetMessages } from "../reducers/messages";

export const clickFX = new Audio("https://www.extrahash.org/move.wav");
clickFX.load();

export const alertFX = new Audio("https://www.extrahash.org/alert.wav");
alertFX.load();

export default function Sidebar(): JSX.Element {
    const user: IUser = useSelector(selectUser);
    const history = useHistory();
    const params: { userID: string } = useParams();

    const dispatch = useDispatch();
    const inputs = useSelector(selectInputStates);

    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const conversations: Record<string, string[]> = useSelector(
        selectConversations
    );

    return (
        <div className="sidebar">
            <div className="field has-addons search-wrapper">
                <figure className="user-icon image is-32x32">
                    {user.userID !== "" && (
                        <div
                            className={`dropdown ${
                                inputs["own-user-icon-dropdown"] || ""
                            }`}
                        >
                            <div
                                className="dropdown-trigger pointer"
                                onClick={() => {
                                    if (
                                        inputs["own-user-icon-dropdown"] ==
                                            "" ||
                                        inputs["own-user-icon-dropdown"] ==
                                            undefined
                                    ) {
                                        dispatch(
                                            addInputState(
                                                "own-user-icon-dropdown",
                                                "is-active"
                                            )
                                        );
                                    } else {
                                        dispatch(
                                            addInputState(
                                                "own-user-icon-dropdown",
                                                ""
                                            )
                                        );
                                    }
                                }}
                            >
                                <img
                                    className="is-rounded"
                                    src={strToIcon(user.username.slice(0, 2))}
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
                                            await client.close();
                                            dispatch(
                                                addInputState(
                                                    "own-user-icon-dropdown",
                                                    ""
                                                )
                                            );

                                            // reset state
                                            dispatch(resetConversations());
                                            dispatch(resetFamiliars());
                                            dispatch(resetInputStates());
                                            dispatch(resetMessages());
                                            dispatch(resetUser());
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
                    <p className="control has-icons-left">
                        <input
                            className="input has-icons-left is-grey is-small is-rounded search-bar"
                            type="text"
                            placeholder="Search"
                            value={inputs["search-bar"] || ""}
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
                                            dispatch(
                                                addFamiliar(serverResults)
                                            );
                                            dispatch(
                                                addInputState("search-bar", "")
                                            );
                                            dispatch(
                                                addConversation({
                                                    userID:
                                                        serverResults.userID,
                                                })
                                            );
                                            history.push(
                                                "./" + serverResults.userID
                                            );
                                            clickFX.play();
                                        }
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                        />
                        <span className="icon is-small is-left">
                            <FontAwesomeIcon
                                className="is-left"
                                icon={faSearch}
                            />
                        </span>
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

                    {Object.keys(conversations).map((userID) => {
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
            <Link to={"./" + user.userID}>
                {IconUsername(user, 48, subtitle)}
            </Link>
        </li>
    );
}
