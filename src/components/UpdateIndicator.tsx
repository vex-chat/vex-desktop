import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { remote } from "electron";

export function UpdateIndicator(props: { className?: string }): JSX.Element {
    return (
        <div
            className={`update-indicator ${props.className || ""}`}
            onClick={() => {
                remote.app.relaunch();
                remote.app.exit();
            }}
        >
            <span className="is-size-7 has-text-link update-indicator-label">
                Update available
            </span>
            &nbsp;&nbsp;
            <FontAwesomeIcon icon={faDownload} />
        </div>
    );
}
