import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IUser } from "@vex-chat/vex";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { match, Route, Switch, useParams } from "react-router";
import { ChannelBar } from "../components/ChannelBar";
import { UserMenu, UserSearchBar, emptyUser } from "../components/MessagingBar";
import { chunkMessages, MessageBox } from "../components/MessagingPane";
import { ServerBar } from "../components/ServerBar";
import { routes } from "../constants/routes";
import { selectChannels } from "../reducers/channels";
import {
    selectGroupMessages,
    failGroupMessage,
} from "../reducers/groupMessages";
import { addInputState, selectInputStates } from "../reducers/inputs";
import { selectServers } from "../reducers/servers";
import * as uuid from "uuid";
import { IconUsername } from "../components/IconUsername";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Server(props: { match: match<any> }): JSX.Element {
    const servers = useSelector(selectServers);
    const channels = useSelector(selectChannels);

    const { serverID, channelID } = props.match.params;
    const serverChannels = channels ? channels[serverID] || {} : {};

    const server = servers[serverID];

    // loading
    if (!server) {
        return <div />;
    }

    return (
        <div>
            <ServerBar />
            <ChannelBar server={servers[serverID]} />
            <UserMenu />
            <div className="pane">
                <div className="pane-topbar">
                    {serverChannels[channelID] && (
                        <h2 className="subtitle">
                            <FontAwesomeIcon icon={faHashtag} />
                            &nbsp;&nbsp;
                            {serverChannels[channelID].name}
                        </h2>
                    )}
                </div>
                <Switch>
                    <Route
                        exact
                        path={routes.SERVERS + "/:serverID/:channelID/add-user"}
                        render={() => <AddUser />}
                    />
                    <Route
                        exact
                        path={routes.SERVERS + "/:serverID/:channelID"}
                        render={() => <ServerPane />}
                    />
                </Switch>
            </div>
        </div>
    );
}

interface IServerParams {
    serverID: string;
    channelID: string;
}
export function AddUser(): JSX.Element {
    const servers = useSelector(selectServers);
    const params: IServerParams = useParams();
    const [user, setUser] = useState(emptyUser);
    const server = servers[params.serverID];

    const addUserPermission = async (user: IUser) => {
        const client = window.vex;
        const { userID } = user;
        await client.permissions.create({
            userID,
            resourceType: "server",
            resourceID: params.serverID,
        });
    };

    return (
        <div className="pane-screen-wrapper">
            <div className="panel">
                <div className="panel-heading">Add a user to {server.name}</div>
                <div className="panel-block">
                    <UserSearchBar
                        formName={
                            "server-user-serach-bar" +
                            params.serverID +
                            params.channelID
                        }
                        onFoundUser={async (user: IUser) => {
                            setUser(user);
                        }}
                    />
                </div>
                {user !== emptyUser && (
                    <Fragment>
                        <div className="panel-block">{IconUsername(user)}</div>
                        <div className="panel-block">
                            <button
                                className="button is-small"
                                onClick={() => addUserPermission(user)}
                            >
                                Add user to {server.name}
                            </button>
                        </div>
                    </Fragment>
                )}
            </div>
        </div>
    );
}

export function ServerPane(): JSX.Element {
    const params: IServerParams = useParams();
    const groupMessages = useSelector(selectGroupMessages);
    const threadMessages = groupMessages[params.channelID];
    const inputs = useSelector(selectInputStates);
    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (messagesEndRef.current as any).scrollIntoView();
        }
    };

    useEffect(() => {
        scrollToBottom();
    });

    return (
        <Fragment>
            <div className="conversation-wrapper">
                {chunkMessages(threadMessages || {}).map((chunk) => {
                    return (
                        <MessageBox
                            key={chunk[0]?.mailID || uuid.v4()}
                            messages={chunk}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-wrapper">
                <textarea
                    value={inputs[params.channelID]}
                    className="textarea chat-input has-fixed-size"
                    onChange={(event) => {
                        dispatch(
                            addInputState(params.channelID, event.target.value)
                        );
                    }}
                    onKeyDown={async (event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();

                            const messageText = inputs[params.channelID];
                            dispatch(addInputState(params.channelID, ""));

                            const client = window.vex;
                            try {
                                await client.messages.group(
                                    params.channelID,
                                    messageText
                                );
                            } catch (err) {
                                console.log(err);
                                if (err.message) {
                                    console.log(err);
                                    dispatch(
                                        failGroupMessage(
                                            err.message,
                                            err.error.error
                                        )
                                    );
                                } else {
                                    console.warn(err);
                                }
                            }
                        }
                    }}
                />
            </div>
        </Fragment>
    );
}
