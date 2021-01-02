import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

export function ServerIconButton(props: {
    linkTo: string;
    icon: IconDefinition;
    active: boolean;
}): JSX.Element {
    return (
        <div className={`server-icon-wrapper`}>
            <Link to={props.linkTo}>
                <button
                    className={`button is-medium server-button${
                        props.active ? " is-active" : ""
                    }`}
                >
                    <span className="icon is-medium">
                        <FontAwesomeIcon
                            className="server-button-icon"
                            icon={props.icon}
                        />
                    </span>
                </button>
            </Link>
        </div>
    );
}
