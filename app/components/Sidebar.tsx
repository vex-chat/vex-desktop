import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IUser } from "@vex-chat/vex-js";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectFamiliars } from "../reducers/familiars";
import { selectUser } from "../reducers/user";
import { strToIcon } from "../utils/strToIcon";
import { IconUsername } from "./IconUsername";

export default function Sidebar(): JSX.Element {
    const user: IUser = useSelector(selectUser);
    const familiars: Record<string, IUser> = useSelector(selectFamiliars);

    return (
        <div className="sidebar">
            <div className="field has-addons search-wrapper">
                <figure className="user-icon image is-32x32">
                    {user.userID !== "" && (
                        <img
                            className="is-rounded"
                            src={strToIcon(user.username.slice(0, 2))}
                        />
                    )}
                </figure>
                <div className="field">
                    <p className="control has-icons-left">
                        <input
                            className="input has-icons-left is-grey is-small is-rounded"
                            type="text"
                            placeholder="Search"
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
                    {Object.keys(familiars).map((familiar) =>
                        FamiliarButton({ user: familiars[familiar] })
                    )}
                </ul>
            </aside>
        </div>
    );
}

type buttonProps = {
    user: IUser;
};

function FamiliarButton({ user }: buttonProps): JSX.Element {
    return (
        <li key={user.userID}>
            <Link to={"/" + user.userID}>{IconUsername(user, 48)}</Link>
        </li>
    );
}
