import { IUser } from "@vex-chat/vex-js";
import React from "react";
import { strToIcon } from "../utils/strToIcon";

export function IconUsername(user: IUser, iconSize = 48 | 32): JSX.Element {
    const size = iconSize.toString() + "x" + iconSize.toString();

    return (
        <span className="media">
            <div className="media-left">
                <figure className={`image is-${size}`}>
                    <img
                        className="is-rounded"
                        src={strToIcon(user.username)}
                    />
                </figure>
            </div>
            <div className="media-content">
                <p className={`title is-6 username-text-${size}`}>
                    {user.username}
                </p>
            </div>
        </span>
    );
}
