import type { XTypes } from "@vex-chat/types";

import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { clipboard, shell } from "electron";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { selectFamiliars } from "../reducers/familiars";

export function AddUser(): JSX.Element {
    const params: { serverID: string } = useParams();
    console.log(params);
    const [links, setLinks] = useState([] as XTypes.SQL.IInvite[]);
    const familiars = useSelector(selectFamiliars);

    const createLink = async () => {
        const client = window.vex;
        const link = await client.invites.create(params.serverID, "1h");
        console.log(link);
        if (link) {
            const newLinks = [...links, link];
            setLinks(newLinks);
        }
    };

    useMemo(async () => {
        const client = window.vex;
        const invites = await client.invites.retrieve(params.serverID);

        setLinks(invites);
    }, []);

    return (
        <div className="pane-screen-wrapper">
            {links.length > 0 && (
                <table className="table is-striped is-narrow is-fullwidth">
                    <thead>
                        <tr>
                            <td />
                            <td>Code</td>
                            <td>Owner</td>
                            <td>Expires</td>
                            <td />
                        </tr>
                    </thead>
                    <tbody>
                        {links.map((link) => (
                            <tr key={link.inviteID}>
                                <td
                                    className="pointer"
                                    onClick={() => {
                                        console.log(link);
                                        clipboard.writeText(
                                            `https://vex.chat/invite/${link.inviteID}`
                                        );
                                    }}
                                >
                                    <FontAwesomeIcon icon={faCopy} />
                                </td>
                                <td>
                                    <p className="help is-family-monospace">
                                        {link.inviteID}
                                    </p>
                                </td>
                                <td>{familiars[link.owner].username}</td>
                                <td>
                                    {format(
                                        new Date(link.expiration),
                                        "kk:mm MM/dd/yyyy"
                                    )}
                                </td>
                                <td
                                    className="pointer"
                                    onClick={() => {
                                        shell.openExternal(
                                            `https://vex.chat/invite/${link.inviteID}`
                                        );
                                    }}
                                >
                                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {links.length == 0 && (
                <div className="help">
                    No invite links! You can create one. <br />
                </div>
            )}
            <div className="buttons is-right">
                <button
                    className="button is-small is-plain"
                    onClick={createLink}
                >
                    Create Link
                </button>
            </div>
        </div>
    );
}
