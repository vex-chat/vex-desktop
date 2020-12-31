import { faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IUser } from '@vex-chat/libvex';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addInputState, selectInputStates } from '../reducers/inputs';
import { emptyUser } from './MessagingBar';

export function UserSearchBar(props: {
    formName: string;
    onSelectUser?: (user: IUser) => void;
    onFoundUser?: (user: IUser) => void;
}): JSX.Element {
    const [foundUser, setFoundUser] = useState(emptyUser);
    const dispatch = useDispatch();
    const inputs = useSelector(selectInputStates);

    return (
        <div className="control has-icons-left">
            <input
                className={`input has-icons-right is-grey is-small is-rounded search-bar${
                    foundUser.userID !== '' ? ' is-success' : ''
                }`}
                type="text"
                placeholder="Search for user"
                value={inputs[props.formName] || ''}
                onKeyDown={async (event) => {
                    if (event.key === 'Enter') {
                        if (foundUser.userID !== '') {
                            dispatch(addInputState(props.formName, ''));
                            setFoundUser(emptyUser);
                            if (props.onSelectUser) {
                                props.onSelectUser(foundUser);
                            }
                        }
                    } else {
                        if (props.onFoundUser) {
                            props.onFoundUser(emptyUser);
                        }
                        setFoundUser(emptyUser);
                    }
                }}
                onChange={async (event) => {
                    dispatch(addInputState(props.formName, event.target.value));
                    try {
                        if (event.target.value.length > 2) {
                            const client = window.vex;
                            const [
                                serverResults,
                                err,
                            ] = await client.users.retrieve(event.target.value);
                            if (
                                err &&
                                err.response &&
                                err.response.status === 404
                            ) {
                                setFoundUser(emptyUser);
                            }
                            if (serverResults) {
                                if (props.onFoundUser) {
                                    props.onFoundUser(serverResults);
                                }
                                setFoundUser(serverResults);
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }}
            />
            <span className="icon is-left">
                <FontAwesomeIcon
                    icon={foundUser === emptyUser ? faSearch : faCheck}
                />
            </span>
        </div>
    );
}
