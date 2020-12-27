import { ISession, IUser } from "@vex-chat/vex";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { selectSessions, stubSession } from "../reducers/sessions";
import { addFamiliar, selectFamiliars } from "../reducers/familiars";
import { selectUser } from "../reducers/user";
import { switchFX } from "../views/Base";
import { routes } from "../constants/routes";
import { FamiliarButton } from "./FamiliarButton";
import { UserSearchBar } from "./UserSearchBar";

export const emptyUser: IUser = {
    userID: "",
    signKey: "",
    username: "",
    lastSeen: new Date(Date.now()),
    avatar: null,
};

export default function MessagingBar(): JSX.Element {
    const FORM_NAME = "dm-search-input";

    const user: IUser = useSelector(selectUser);
    const history = useHistory();
    const params: { userID: string } = useParams();
    const dispatch = useDispatch();

    const familiars: Record<string, IUser> = useSelector(selectFamiliars);
    const sessions: Record<string, Record<string, ISession>> = useSelector(
        selectSessions
    );

    const newConversation = (user: IUser) => {
        switchFX.play();
        dispatch(addFamiliar(user));
        dispatch(stubSession(user.userID));

        history.push(routes.MESSAGING + "/" + user.userID);
    };

    return (
        <div className="sidebar">
            <div className="field search-wrapper">
                <div className="field">
                    <UserSearchBar
                        formName={FORM_NAME}
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

                    {Object.keys(sessions).map((userID) => {
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
