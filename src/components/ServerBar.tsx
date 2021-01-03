import { faEnvelopeOpenText, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { routes } from "../constants/routes";
import { selectServers } from "../reducers/servers";

import { ServerIcon } from "./ServerIcon";
import { ServerIconButton } from "./ServerIconButton";

export function ServerBar(): JSX.Element {
    const servers = useSelector(selectServers);
    const history = useHistory();
    const serverIDs = Object.keys(servers);

    return (
        <div className="serverbar">
            <ServerIconButton
                linkTo={routes.MESSAGING}
                icon={faEnvelopeOpenText}
                active={history.location.pathname.includes(routes.MESSAGING)}
            />
            {serverIDs.map((serverID) => (
                <ServerIcon key={serverID} server={servers[serverID]} />
            ))}
            <ServerIconButton
                linkTo={routes.CREATE + "/server"}
                icon={faPlus}
                active={false}
            />
        </div>
    );
}
