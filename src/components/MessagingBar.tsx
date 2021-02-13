import type { ISession, IUser } from "@vex-chat/libvex";

import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { selectFamiliars } from "../reducers/familiars";
import { selectSessions } from "../reducers/sessions";
import { selectUser } from "../reducers/user";
import store from "../utils/DataStore";

import { FamiliarButton } from "./FamiliarButton";

export default function MessagingBar(): JSX.Element {
    const user: IUser = useSelector(selectUser);
    const params: { userID: string } = useParams();

    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const sessions: Record<string, Record<string, ISession>> = useSelector(
        selectSessions
    );

    return (
        <div className="sidebar">
            <aside className="menu">
                <ul className="menu-list">
                    {FamiliarButton({
                        user: familiars[user.userID],
                        params,
                        subtitle: "Me",
                    })}

                    {store.get("settings.directMessages") &&
                        Object.keys(sessions).map((userID) => {
                            if (familiars[userID] === undefined) {
                                return;
                            }

                            if (user.userID === userID) {
                                return;
                            }

                            return FamiliarButton({
                                user: familiars[userID],
                                params,
                                subtitle: "",
                            });
                        })}
                </ul>
            </aside>
        </div>
    );
}
