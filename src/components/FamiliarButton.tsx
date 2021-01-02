import type { IUser } from "@vex-chat/libvex";
import React from "react";
import { Link } from "react-router-dom";

import { routes } from "../constants/routes";
import { IconUsername } from "./IconUsername";

type buttonProps = {
    user: IUser;
    params: { userID: string };
    subtitle: string;
};

export function FamiliarButton({
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
