import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IUser } from "@vex-chat/vex-js";
import React, { Fragment, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { match, Route, Switch } from "react-router";
import { ChannelBar } from "../components/ChannelBar";
import { UserMenu, UserSearchBar } from "../components/MessagingBar";
import { chunkMessages, MessageBox } from "../components/MessagingPane";
import { ServerBar } from "../components/ServerBar";
import { routes } from "../constants/routes";
import { selectChannels } from "../reducers/channels";
import { selectFamiliars } from "../reducers/familiars";
import { selectGroupMessages } from "../reducers/groupMessages";
import { addInputState, selectInputStates } from "../reducers/inputs";
import { selectServers } from "../reducers/servers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Server(props: { match: match<any> }): JSX.Element {
    const dispatch = useDispatch();
    const groupMessages = useSelector(selectGroupMessages);
    const servers = useSelector(selectServers);
    const familiars = useSelector(selectFamiliars);
    const inputs = useSelector(selectInputStates);
    const messagesEndRef = useRef(null);
    const channels = useSelector(selectChannels);

    const { serverID, channelID } = props.match.params;
    const threadMessages = groupMessages[channelID];
    const serverChannels = channels[serverID];

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
                        render={({ match }) => (
                            <div className="pane-screen-wrapper">
                                <UserSearchBar
                                    formName={
                                        "server-user-serach-bar" +
                                        match.params.serverID +
                                        match.params.channelID
                                    }
                                    onSelectUser={async (user: IUser) => {
                                        const client = window.vex;

                                        const { userID } = user;

                                        const permission = await client.permissions.create(
                                            {
                                                userID,
                                                resourceType: "server",
                                                resourceID:
                                                    match.params.serverID,
                                            }
                                        );

                                        console.log(permission);
                                    }}
                                />
                            </div>
                        )}
                    />
                    <Route
                        exact
                        path={routes.SERVERS + "/:serverID/:channelID"}
                        render={() => (
                            <Fragment>
                                <div className="conversation-wrapper">
                                    {chunkMessages(threadMessages || {}).map(
                                        (chunk) => {
                                            return MessageBox(chunk, familiars);
                                        }
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="chat-input-wrapper">
                                    <textarea
                                        value={inputs[channelID]}
                                        className="textarea chat-input has-fixed-size"
                                        onChange={(event) => {
                                            dispatch(
                                                addInputState(
                                                    channelID,
                                                    event.target.value
                                                )
                                            );
                                        }}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" &&
                                                !event.shiftKey
                                            ) {
                                                event.preventDefault();

                                                const client = window.vex;

                                                // send to group
                                                client.messages.group(
                                                    channelID,
                                                    inputs[channelID]
                                                );

                                                dispatch(
                                                    addInputState(channelID, "")
                                                );
                                            }
                                        }}
                                    />
                                </div>
                            </Fragment>
                        )}
                    ></Route>
                </Switch>
            </div>
        </div>
    );
}
