import type { IServerParams } from '~Types';

import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Highlighter } from './Highlighter';
import { selectChannels } from '../reducers/channels';

export function ChannelSettings(): JSX.Element {
    const params: IServerParams = useParams();
    const channels = useSelector(selectChannels(params.serverID));

    return (
        <div className="pane-screen-wrapper">
            <label className="label is-small">Details:</label>
            {Highlighter(
                JSON.stringify(channels[params.channelID] || {}, null, 4),
                'json'
            )}
        </div>
    );
}
