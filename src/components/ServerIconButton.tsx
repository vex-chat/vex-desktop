import { Server as ServerIcon } from "react-feather";
import { Link } from "react-router-dom";

export function ServerIconButton(props: {
    linkTo: string;
    active: boolean;
    icon?: JSX.Element;
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
                        {props.icon ? props.icon : <span />}
                    </span>
                </button>
            </Link>
        </div>
    );
}
