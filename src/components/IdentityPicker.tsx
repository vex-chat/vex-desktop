import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IUser } from "@vex-chat/libvex";
import { Client } from "@vex-chat/libvex";
import fs from "fs";
import React, { Fragment, useMemo, useState } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";

import { dbFolder, keyFolder } from "../constants/folders";
import { routes } from "../constants/routes";
import { useQuery } from "../hooks/useQuery";
import { IconUsername } from "./IconUsername";
import Loading from "./Loading";
import { VerticalAligner } from "./VerticalAligner";

export function IdentityPicker(): JSX.Element {
    const pubkeyRegex = /[0-9a-f]{64}/;

    const initialState: Record<string, IUser> = {};
    const [initialLoad, setInitialLoad] = useState(true);
    const [accounts, setAccounts] = useState(initialState);
    const history = useHistory();
    const query = useQuery();

    const [deleteMarked, setDeleteMarked] = useState([] as string[]);

    const manage = query.get("manage") === "on";

    void useMemo(async () => {
        const keyFiles = fs.readdirSync(keyFolder);
        const tempClient = new Client(undefined, { dbFolder });
        const accs: Record<string, IUser> = {};

        for (const keyFile of keyFiles) {
            if (!pubkeyRegex.test(keyFile)) {
                continue;
            }

            // filename is public key
            const [user, err] = await tempClient.users.retrieve(keyFile);
            if (err) {
                console.warn(err);
                continue;
            }
            if (user) {
                accs[user.signKey] = user;
            }
        }
        setAccounts(accs);
        setInitialLoad(false);
    }, [history]);

    if (initialLoad) {
        return <Loading size={256} animation={"cylon"} />;
    }

    if (!initialLoad && Object.keys(accounts).length === 0) {
        history.push(routes.REGISTER);
    }

    return (
        <VerticalAligner>
            <p className="title">Local Identities</p>
            <p className="subtitle">Which identity would you like to use?</p>

            <div className="panel is-light identity-panel">
                {Object.keys(accounts).length > 0 &&
                    Object.keys(accounts).map((key) => (
                        <div key={key} className="panel-block identity-link">
                            {manage ? (
                                <Fragment>
                                    <span
                                        className={`icon identity-trash ${
                                            deleteMarked.includes(key)
                                                ? "has-text-danger"
                                                : "has-text-dark"
                                        }`}
                                        onClick={() => {
                                            const markedForDeletion = [
                                                ...deleteMarked,
                                            ];
                                            if (
                                                markedForDeletion.includes(key)
                                            ) {
                                                console.log(
                                                    "deletarino " + key
                                                );
                                                fs.unlinkSync(
                                                    keyFolder + "/" + key
                                                );
                                                fs.unlinkSync(
                                                    dbFolder +
                                                        "/" +
                                                        key +
                                                        ".sqlite"
                                                );

                                                // copy accounts
                                                const accs = { ...accounts };
                                                delete accs[key];
                                                setAccounts(accs);
                                            } else {
                                                markedForDeletion.push(key);
                                                setDeleteMarked(
                                                    markedForDeletion
                                                );
                                            }
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className="is-size-2"
                                        />
                                    </span>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                </Fragment>
                            ) : null}

                            <span
                                className="identity-link"
                                onClick={() => {
                                    if (!manage) {
                                        history.push(
                                            routes.LOGIN + "?key=" + key
                                        );
                                    }
                                }}
                            >
                                {IconUsername(accounts[key])}
                            </span>
                        </div>
                    ))}
            </div>

            <div className="buttons is-right">
                <Link
                    to={routes.HOME + "?manage=" + (manage ? "off" : "on")}
                    className="button"
                    onClick={() => {
                        if (manage) {
                            setDeleteMarked([] as string[]);
                        }
                    }}
                >
                    {manage ? "Stop Managing" : "Manage"}
                </Link>
                <Link to={routes.REGISTER} className={`button`}>
                    New Identity
                </Link>
            </div>
        </VerticalAligner>
    );
}
