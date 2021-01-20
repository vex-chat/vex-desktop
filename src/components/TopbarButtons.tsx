import {
    faUpload,
    faUsers,
    faUsersSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { remote } from "electron";

import { DataStore } from "../utils";

export function TopbarButtons(props: {
    updateAvailable: boolean;
    userBarOpen: boolean;
    setUserBarOpen: ((state: boolean) => void) | null;
    pageType: string;
    className?: string;
}): JSX.Element {
    return (
        <div
            className={`topbar-buttons ${props.className || ""} ${
                props.userBarOpen ? "server" : ""
            }`}
        >
            {props.updateAvailable && (
                <span
                    className="icon topbar-button has-text-link"
                    onClick={() => {
                        remote.app.relaunch();
                        remote.app.exit();
                    }}
                >
                    <FontAwesomeIcon icon={faUpload} />
                </span>
            )}

            {props.setUserBarOpen && props.pageType === "channels" && (
                <span
                    className="icon topbar-button"
                    onClick={() => {
                        if (props.setUserBarOpen) {
                            props.setUserBarOpen(!props.userBarOpen);
                            DataStore.set(
                                "settings.userBarOpen",
                                !props.userBarOpen
                            );
                        }
                    }}
                >
                    <FontAwesomeIcon
                        icon={props.userBarOpen ? faUsersSlash : faUsers}
                    />
                </span>
            )}
        </div>
    );
}
