import type { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import type { IUser } from "@vex-chat/libvex";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Avatar } from "../components/Avatar";

export function IconUsername(
    user: IUser,
    iconSize = 48 | 32,
    icon?: IconDefinition,
    subtitle = ""
): JSX.Element {
    const size = iconSize.toString() + "x" + iconSize.toString();

    return (
        <span className="media">
            <span className="media-left">
                {icon !== undefined ? (
                    <FontAwesomeIcon className="icon-username-fa" icon={icon} />
                ) : (
                    <figure className={`image is-${size}`}>
                        <Avatar user={user} />
                    </figure>
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
