import React, { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { selectUser } from "../reducers/user";
import { IUser } from "@vex-chat/vex-js";

function strToIcon(s: string) {
    s.replace(/\s/g, "");

    return `https://i0.wp.com/cdn.auth0.com/avatars/${s
        .substring(0, 2)
        .toLowerCase()}.png`;
}

export default function Home(): JSX.Element {
    const user: IUser = useSelector(selectUser);

    return (
        <Fragment>
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
                        <li>
                            <a></a>
                        </li>
                        {/* {conversations.map((conversation) => (
                            <li key={conversation}>
                                <a>{conversation}</a>
                            </li>
                        ))} */}
                    </ul>
                </aside>
            </div>
            <div className="pane">
                <div className="container">
                    {user.userID !== "" && (
                        <pre>
                            <code>{JSON.stringify(user, null, 4)}</code>
                        </pre>
                    )}
                </div>
            </div>
        </Fragment>
    );
}
