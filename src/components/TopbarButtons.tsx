import {
    faUpload,
    faUsers,
    faUsersSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { remote } from "electron";
import { useHistory } from "react-router-dom";

import { DataStore } from "../utils";

export function TopbarButtons(props: {
    updateAvailable: boolean;
    userBarOpen?: boolean;
    setUserBarOpen?: ((state: boolean) => void) | null;
    className?: string;
}): JSX.Element {
    const history = useHistory();

    return (
        <div className={`topbar-buttons ${props.className || ""}`}>
            {props.updateAvailable && (
                <span
                    className="icon topbar-button has-text-link no-drag"
                    onClick={() => {
                        remote.app.relaunch();
                        remote.app.exit();
                    }}
                >
                    <FontAwesomeIcon icon={faUpload} />
                </span>
            )}
            {history.location.pathname.includes("server") && (
                <span
                    className="icon topbar-button no-drag"
                    onClick={() => {
                        if (props.setUserBarOpen) {
                            props.setUserBarOpen(!props.userBarOpen || false);
                            DataStore.set(
                                "settings.userBarOpen",
                                !props.userBarOpen || false
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
