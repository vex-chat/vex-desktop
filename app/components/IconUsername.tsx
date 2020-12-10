import { IUser } from "@vex-chat/vex-js";
import React from "react";
import { strToIcon } from "../utils/strToIcon";

export function IconUsername(
    user: IUser,
    iconSize = 48 | 32,
    subtitle = ""
): JSX.Element {
    const size = iconSize.toString() + "x" + iconSize.toString();

    return (
        <span className="media">
            <span className="media-left">
                <figure className={`image is-${size}`}>
                    <img
                        className="is-rounded"
                        src={strToIcon(user.username)}
                    />
                </figure>
            </span>
            <span className="media-content">
                <p
                    className={`title is-6 username-text-${size} ${
                        subtitle !== "" ? "has-subtitle" : ""
                    }`}
                >
                    {user.username}
                </p>
                <p className={"help subtitle is-7"}>{subtitle}</p>
            </span>
        </span>
    );
}
