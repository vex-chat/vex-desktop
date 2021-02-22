import { capitalCase } from "change-case";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory, useParams } from "react-router";
import { Hash as HashIcon, Server as ServerIcon } from "react-feather";
import {
    AddChannel,
    AddUser,
    Avatar,
    ChannelBar,
    ChannelSettings,
    FamiliarMenu,
    ServerBar,
    ServerPane,
    ServerSettings,
    TitleBar,
    UserMenu,
} from "../components";
import { routes } from "../constants";
import { selectChannels } from "../reducers/channels";
import { push as pushHistoryStack } from "../reducers/historyStacks";
import { selectOnlineList } from "../reducers/onlineLists";
import { selectServers } from "../reducers/servers";
import { DataStore } from "../utils";

export function Server(props: {
    updateAvailable: boolean;
    outboxMessages: string[];
    setOutboxMessages: (arr: string[]) => void;
}): JSX.Element {
    const params = useParams<{
        serverID: string;
        channelID: string;
        pageType: string;
        channelPage?: string;
    }>();
    const dispatch = useDispatch();
    const history = useHistory();
    const { serverID, channelID, pageType, channelPage } = params;

    const servers = useSelector(selectServers);
    const serverChannels = useSelector(selectChannels(serverID));
    const onlineList = useSelector(selectOnlineList(channelID));

    const server = servers[serverID];

    const [userBarOpen, setUserBarOpen] = useState(
        DataStore.get("settings.userBarOpen") as boolean
    );

    useMemo(() => {
        if (
            params.pageType === "channels" &&
            !params.channelPage &&
            server?.serverID
        ) {
            dispatch(
                pushHistoryStack({
                    serverID: server.serverID,
                    path: history.location.pathname,
                })
            );
        }
    }, [history.location.pathname]);

    // loading
    if (!server) {
        return <div />;
    }

    return (
        <div>
            <TitleBar
                updateAvailable={props.updateAvailable}
                userBarOpen={userBarOpen}
                setUserBarOpen={setUserBarOpen}
                showButtons={true}
            />
            <ServerBar />
            <ChannelBar name={server.name} serverID={serverID} />
            <UserMenu />
            <div
                className={`pane ${
                    userBarOpen && params.pageType === "channels"
                        ? ""
                        : "direct-messaging"
                }`}
            >
                <div className="pane-topbar">
                    {serverChannels[channelID] && (
                        <h2 className="subtitle">
                            <HashIcon size={14} />
                            &nbsp;&nbsp;
                            {serverChannels[channelID].name}{" "}
                            {capitalCase(channelPage || "")}
                        </h2>
                    )}
                    {!serverChannels[channelID] && server !== undefined && (
                        <h2 className="subtitle">
                            <ServerIcon size={14} />
                            &nbsp;&nbsp;
                            {server.name} {capitalCase(pageType || "")}
                        </h2>
                    )}
                </div>
                <Switch>
                    <Route
                        exact
                        path={routes.SERVERS + "/:serverID/invite-links"}
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
                        render={() => (
                            <ServerPane
                                outboxMessages={props.outboxMessages}
                                setOutboxMessages={props.setOutboxMessages}
                                userBarOpen={userBarOpen}
                            />
                        )}
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
            <div className="right-topbar"></div>
            {userBarOpen && params.pageType === "channels" && (
                <div className="right-bar">
                    <p className="menu-label">Online</p>
                    {[...onlineList]
                        .reverse()
                        .filter((user) =>
                            withinTimeLimit(user.lastSeen, 1000 * 60 * 5)
                        )
                        .map((user) => (
                            <div className={`online-user`} key={user.userID}>
                                <article className="media">
                                    <figure className="media-left">
                                        <div className="image">
                                            <FamiliarMenu
                                                familiar={user}
                                                trigger={
                                                    <Avatar
                                                        user={user}
                                                        size={32}
                                                    />
                                                }
                                            />
                                        </div>
                                    </figure>
                                    <div className="media-content">
                                        {user.username}
                                    </div>
                                </article>
                            </div>
                        ))}
                    <p className="menu-label">Offline</p>
                    {[...onlineList]
                        .reverse()
                        .filter(
                            (user) =>
                                !withinTimeLimit(user.lastSeen, 1000 * 60 * 5)
                        )
                        .map((user) => (
                            <div className={`online-user`} key={user.userID}>
                                <article className="media">
                                    <figure className="media-left">
                                        <div className="image rightbar-trigger">
                                            <FamiliarMenu
                                                familiar={user}
                                                trigger={
                                                    <Avatar
                                                        className="dim"
                                                        user={user}
                                                        size={32}
                                                    />
                                                }
                                            />
                                        </div>
                                    </figure>
                                    <div className="media-content dim">
                                        {user.username}
                                    </div>
                                </article>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

const withinTimeLimit = (
    dateLike: Date | string | number,
    timeLimit: number
): boolean => {
    return (
        new Date(Date.now()).getTime() - new Date(dateLike).getTime() <
        timeLimit
    );
};
