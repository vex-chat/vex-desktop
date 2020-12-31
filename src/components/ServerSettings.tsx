import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { routes } from '../constants/routes';
import { delServer, selectServers } from '../reducers/servers';
import { IServerParams } from '../views/Server';
import { Highlighter } from './Highlighter';

export function ServerSettings(): JSX.Element {
    const servers = useSelector(selectServers);
    const params: IServerParams = useParams();
    const history = useHistory();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const dispatch = useDispatch();

    const server = servers[params.serverID];
    if (!server) {
        return <div />;
    }

    return (
        <div className="pane-screen-wrapper">
            <h1 className="title">Server Settings</h1>
            {Highlighter(JSON.stringify(server, null, 4), 'json')}
            <br />
            <h2 className="subtitle">
                <FontAwesomeIcon
                    className="has-text-danger"
                    icon={faExclamationTriangle}
                />{' '}
                Danger Zone
            </h2>
            <button
                className="button is-danger"
                onClick={() => {
                    setConfirmDeleteOpen(true);
                }}
            >
                Delete Server
            </button>

            <div className={`modal ${confirmDeleteOpen ? 'is-active' : ''}`}>
                <div
                    className="modal-background"
                    onClick={() => {
                        setConfirmDeleteOpen(true);
                    }}
                ></div>
                <div className="modal-content">
                    <div className="box">
                        <h1 className="title">Caution!</h1>
                        You are about to delete the server{' '}
                        <strong>{server.name}</strong> permanently. This cannot
                        be undone. Are you certain you wish to continue?
                        <br />
                        <br />
                        <div className="buttons is-right">
                            <div
                                className="button"
                                onClick={() => {
                                    setConfirmDeleteOpen(false);
                                }}
                            >
                                Cancel
                            </div>
                            <div
                                className="button is-danger"
                                onClick={async () => {
                                    const client = window.vex;
                                    await client.servers.delete(
                                        params.serverID
                                    );
                                    dispatch(delServer(params.serverID));
                                    history.push(routes.MESSAGING);
                                }}
                            >
                                Delete {server.name} Permanently
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    className="modal-close is-large"
                    aria-label="close"
                    onClick={() => {
                        setConfirmDeleteOpen(false);
                    }}
                ></button>
            </div>
        </div>
    );
}
