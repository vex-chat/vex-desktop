import type { IUser } from "@vex-chat/libvex";

import Avatar from "../components/Avatar";

export function IconUsername(
    user: IUser,
    iconSize = 48 | 32,
    icon?: JSX.Element,
    subtitle = "",
    avatarClassName = ""
): JSX.Element {
    const size = iconSize.toString() + "x" + iconSize.toString();

    return (
        <span className="media">
            <span className="media-left">
                {icon !== undefined ? (
                    icon
                ) : (
                    <Avatar user={user} className={avatarClassName} />
                )}
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
