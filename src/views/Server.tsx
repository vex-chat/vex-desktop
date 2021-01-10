import { faHashtag, faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { capitalCase } from "change-case";
import { useSelector } from "react-redux";
import { Route, Switch, useParams } from "react-router";

import { Avatar } from "../components/Avatar";
import { ChannelBar } from "../components/ChannelBar";
import { ChannelSettings } from "../components/ChannelSettings";
import { AddChannel } from "../components/ServerAddChannel";
import { AddUser } from "../components/ServerAddUser";
import { ServerBar } from "../components/ServerBar";
import { ServerPane } from "../components/ServerPane";
import { ServerSettings } from "../components/ServerSettings";
import { UserMenu } from "../components/UserMenu";
import { routes } from "../constants/routes";
import { selectChannels } from "../reducers/channels";
import { selectOnlineList } from "../reducers/onlineLists";
import { selectServers } from "../reducers/servers";
import { sortByTimeKey } from "../utils/chunkMessages";

export function Server(): JSX.Element {
    const params = useParams<{
        serverID: string;
        channelID: string;
        pageType: string;
        channelPage?: string;
    }>();

    const { serverID, channelID, pageType, channelPage } = params;

    const servers = useSelector(selectServers);
    const serverChannels = useSelector(selectChannels(serverID));
    const onlineList = useSelector(selectOnlineList(channelID));

    const server = servers[serverID];

    // loading
    if (!server) {
        return <div />;
    }

    return (
        <div>
            <ServerBar />
            <ChannelBar name={server.name} serverID={serverID} />
            <UserMenu />
            <div className="pane">
                <div className="pane-topbar">
                    {serverChannels[channelID] && (
                        <h2 className="subtitle">
                            <FontAwesomeIcon icon={faHashtag} />
                            &nbsp;&nbsp;
                            {serverChannels[channelID].name}{" "}
                            {channelPage ? capitalCase(channelPage) : ""}
                        </h2>
                    )}
                    {!serverChannels[channelID] && server !== undefined && (
                        <h2 className="subtitle">
                            <FontAwesomeIcon icon={faServer} />
                            &nbsp;&nbsp;
                            {server.name}{" "}
                            {pageType !== "channels"
                                ? capitalCase(pageType)
                                : ""}
                        </h2>
                    )}
                </div>
                <Switch>
                    <Route
                        exact
                        path={routes.SERVERS + "/:serverID/add-user"}
                        render={() => <AddUser />}
                    />
                    <Route
                        exact
                        path={routes.SERVERS + "/:serverID/add-channel"}
                        render={() => <AddChannel />}
                    />
                    <Route
                        exact
                        path={routes.SERVERS + "/:serverID/settings"}
                        render={() => <ServerSettings />}
                    />
                    <Route
                        exact
                        path={
                            routes.SERVERS + "/:serverID/channels/:channelID?"
                        }
                        render={() => <ServerPane />}
                    />
                    <Route
                        exact
                        path={
                            routes.SERVERS +
                            "/:serverID/channels/:channelID?/:channelPage?"
                        }
                        render={() => <ChannelSettings />}
                    />
                </Switch>
            </div>
            <div className="right-bar">
                <p className="menu-label">Online</p>
                {sortByTimeKey("lastSeen", [...onlineList])
                    .reverse()
                    .map((user) => (
                        <div
                            className={`online-user${
                                new Date(Date.now()).getTime() -
                                    new Date(user.lastSeen).getTime() >
                                1000 * 60 * 5
                                    ? " offline"
                                    : ""
                            }`}
                            key={user.userID}
                        >
                            <article className="media">
                                <figure className="media-left">
                                    <p className="image is-32x32">
                                        <Avatar user={user} />
                                    </p>
                                </figure>
                                <div className="media-content">
                                    {user.username}
                                </div>
                            </article>
                        </div>
                    ))}
            </div>
        </div>
    );
}
