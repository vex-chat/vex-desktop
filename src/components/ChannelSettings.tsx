import type { IServerParams } from "~Types";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

import { routes } from "../constants";
import { deleteChannel, selectChannels } from "../reducers/channels";

import { Highlighter } from "./Highlighter";
import { Modal } from "./Modal";

export function ChannelSettings(): JSX.Element {
    const params: IServerParams = useParams();
    const dispatch = useDispatch();
    const history = useHistory();
    const channels = useSelector(selectChannels(params.serverID));
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div className="pane-screen-wrapper">
            <Modal
                active={confirmDelete}
                close={() => setConfirmDelete(false)}
                showCancel
                onAccept={async () => {
                    const client = window.vex;
                    console.log(history.location.pathname);
                    history.push(
                        routes.SERVERS + "/" + params.serverID + "/channels"
                    );
                    await client.channels.delete(params.channelID);
                    dispatch(deleteChannel(channels[params.channelID]));
                }}
            >
                <p>
                    Are you sure you want to delete{" "}
                    {channels[params.channelID].name}?
                </p>
            </Modal>
            <label className="label is-small">Details:</label>
            {Highlighter(
                JSON.stringify(channels[params.channelID] || {}, null, 4),
                "json"
            )}
            <br />
            <button
                className="button is-danger is-small"
                onClick={() => setConfirmDelete(true)}
            >
                Delete Channel
            </button>
        </div>
    );
}
