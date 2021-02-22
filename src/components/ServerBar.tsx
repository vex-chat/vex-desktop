import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { routes } from "../constants/routes";
import { getHistoryHead } from "../reducers/historyStacks";
import { selectServers } from "../reducers/servers";
import { selectUser } from "../reducers/user";

import { Mail as MailIcon, Plus as PlusIcon } from "react-feather";

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
        <div className={`serverbar ${process.platform}`}>
            <ServerIconButton
                linkTo={dmHistoryHead || routes.MESSAGING + "/" + user.userID}
                active={history.location.pathname.includes(routes.MESSAGING)}
                icon={<MailIcon size={32} />}
            />
            {serverIDs.map((serverID) => (
                <ServerIcon key={serverID} server={servers[serverID]} />
            ))}
            <ServerIconButton
                linkTo={routes.CREATE + "/server"}
                icon={<PlusIcon size={32} />}
                active={false}
            />
        </div>
    );
}
