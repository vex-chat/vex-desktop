import type { ISession, IUser } from "@vex-chat/libvex";

import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

import { routes } from "../constants/routes";
import { addFamiliar, selectFamiliars } from "../reducers/familiars";
import { selectSessions, stubSession } from "../reducers/sessions";
import { selectUser } from "../reducers/user";
import store from "../utils/DataStore";

import { FamiliarButton } from "./FamiliarButton";
import { UserSearchBar } from "./UserSearchBar";

export default function MessagingBar(): JSX.Element {
    const user: IUser = useSelector(selectUser);
    const history = useHistory();
    const params: { userID: string } = useParams();
    const dispatch = useDispatch();

    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const sessions: Record<string, Record<string, ISession>> = useSelector(
        selectSessions
    );

    const newConversation = (user: IUser) => {
        dispatch(addFamiliar(user));
        dispatch(stubSession(user.userID));

        history.push(routes.MESSAGING + "/" + user.userID);
    };

    return (
        <div className="sidebar">
            <div className="field search-wrapper">
                <div className="field">
                    <UserSearchBar
                        onSelectUser={(user: IUser) => {
                            newConversation(user);
                        }}
                    />
                </div>
            </div>

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
