import { faEnvelopeOpenText, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { routes } from "../constants/routes";
import { getHistoryHead } from "../reducers/historyStacks";
import { selectServers } from "../reducers/servers";
import { selectUser } from "../reducers/user";

import { DM_HISTORY_NAME } from "./MessagingPane";
import { ServerIcon } from "./ServerIcon";
import { ServerIconButton } from "./ServerIconButton";

export function ServerBar(): JSX.Element {
    const servers = useSelector(selectServers);
    const user = useSelector(selectUser);
    const history = useHistory();
    const serverIDs = Object.keys(servers);
    const dmHistoryHead = useSelector(getHistoryHead(DM_HISTORY_NAME));

    return (
        <div className="serverbar">
            <ServerIconButton
                linkTo={dmHistoryHead || routes.MESSAGING + "/" + user.userID}
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
