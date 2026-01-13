import {
    Upload as UploadIcon,
    Users as UsersIcon,
    UserMinus as UserMinusIcon,
} from "react-feather";
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
                        void window.electron.app.relaunch();
                    }}
                >
                    <UploadIcon />
                </span>
            )}
            {history.location.pathname.includes("server") && (
                <span
                    className="icon topbar-button no-drag"
                    onDoubleClick={(event) => {
                        event.stopPropagation();
                    }}
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
                    {props.userBarOpen ? <UserMinusIcon /> : <UsersIcon />}
                </span>
            )}
        </div>
    );
}
