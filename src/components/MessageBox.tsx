import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { allowedHighlighterTypes } from '../constants/allowedHighlighterTypes';
import { routes } from '../constants/routes';
import { selectFamiliars } from '../reducers/familiars';
import { ISerializedMessage } from '../reducers/messages';
import { selectSessions } from '../reducers/sessions';
import { selectUser } from '../reducers/user';
import { strToIcon } from '../utils/strToIcon';
import { Highlighter } from './Highlighter';
import * as uuid from 'uuid';
import crypto from 'crypto';
import { format } from 'date-fns';

export function MessageBox(props: {
    messages: ISerializedMessage[];
}): JSX.Element {
    const user = useSelector(selectUser);
    const familiars = useSelector(selectFamiliars);
    const history = useHistory();

    // don't match no characters of any length
    const regex = /(```[^]+```)/;
    const sender = familiars[props.messages[0]?.sender] || null;

    const sessions = useSelector(selectSessions);

    const sessionIDs = Object.keys(sessions[sender?.userID] || {});
    let hasUnverifiedSession = false;
    for (const sessionID of sessionIDs) {
        if (!sessions[sender.userID][sessionID].verified) {
            hasUnverifiedSession = true;
        }
    }

    if (!sender) {
        return <span key={uuid.v4()} />;
    }

    if (props.messages.length == 0) {
        return <span key={crypto.randomBytes(16).toString('hex')} />;
    }

    return (
        <article className="chat-message media" key={props.messages[0].nonce}>
            <figure className="media-left">
                <p className="image is-48x48">
                    <img
                        className="is-rounded"
                        src={strToIcon(sender.username)}
                    />
                </p>
            </figure>
            <div className="media-content">
                <div className="content message-wrapper">
                    <strong>{sender.username || 'Unknown User'}</strong>
                    &nbsp;&nbsp;
                    <small className="has-text-dark">
                        {format(new Date(props.messages[0].timestamp), 'kk:mm')}
                    </small>
                    &nbsp;&nbsp;
                    {hasUnverifiedSession && sender.userID !== user.userID && (
                        <span
                            className="icon is-small pointer"
                            onClick={() => {
                                history.push(
                                    routes.MESSAGING +
                                        '/' +
                                        sender.userID +
                                        '/verify?forward=' +
                                        history.location.pathname
                                );
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className={'has-text-danger'}
                            />
                        </span>
                    )}
                    <br />
                    {props.messages.map((message) => {
                        const isCode = regex.test(message.message);

                        if (isCode) {
                            // removing ```
                            const languageInput = message.message
                                .replace(/```/g, '')
                                .split('\n')[0]
                                .trim();

                            if (
                                allowedHighlighterTypes.includes(languageInput)
                            ) {
                                return (
                                    <div
                                        className="message-code"
                                        key={message.nonce}
                                    >
                                        {Highlighter(
                                            message.message
                                                .replace(/```/g, '')
                                                .replace(languageInput, '')
                                                .trim(),
                                            languageInput,
                                            message.nonce
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div
                                    className="message-code"
                                    key={message.nonce}
                                >
                                    {Highlighter(
                                        message.message
                                            .replace(/```/g, '')
                                            .trim(),
                                        null
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Fragment key={message.nonce}>
                                <p className="message-text">
                                    {!message.decrypted && (
                                        <code>Decryption Failed</code>
                                    )}
                                    {message.failed ? (
                                        <span className="has-text-danger">
                                            {message.message}
                                        </span>
                                    ) : (
                                        <span
                                            className={`${
                                                message.message.charAt(0) ===
                                                '>'
                                                    ? 'has-text-success has-text-weight-bold'
                                                    : ''
                                            }`}
                                        >
                                            {message.message}
                                        </span>
                                    )}
                                    &nbsp;&nbsp;
                                    {message.failed && (
                                        <span className="help has-text-danger">
                                            <FontAwesomeIcon
                                                icon={faExclamationTriangle}
                                            />{' '}
                                            Failed: {message.failMessage}{' '}
                                        </span>
                                    )}
                                </p>
                            </Fragment>
                        );
                    })}
                </div>
            </div>
            <div className="media-right" />
        </article>
    );
}
