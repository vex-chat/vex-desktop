import React, { Fragment, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setUser } from "../features/counter/userSlice";
import { client } from "..";
import log from "electron-log";

function strToIcon(s: string) {
    s.replace(/\s/g, "");

    return `https://i0.wp.com/cdn.auth0.com/avatars/${s
        .substring(0, 2)
        .toLowerCase()}.png`;
}

export default function Home(): JSX.Element {
    const dispatch = useDispatch();
    const value = useSelector(selectUser);

    useEffect(() => {
        if (Object.keys(value).length === 0) {
            dispatch(setUser({ username: "changed" }));
        }
    });

    return (
        <Fragment>
            <div className="sidebar">
                <div className="field has-addons search-wrapper">
                    <figure className="user-icon image is-32x32">
                        <img className="is-rounded" src={strToIcon("Ex")} />
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
                            <a>{JSON.stringify(value)}</a>
                        </li>
                        {/* {conversations.map((conversation) => (
                            <li key={conversation}>
                                <a>{conversation}</a>
                            </li>
                        ))} */}
                    </ul>
                </aside>
            </div>
            <div className="pane">test</div>
        </Fragment>
    );
}
