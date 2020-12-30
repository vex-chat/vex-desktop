import React, { useMemo } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { routes } from "../constants/routes";
import { useQuery } from "../hooks/useQuery";
import { resetApp } from "../reducers/app";
import { resetChannels } from "../reducers/channels";
import { resetFamiliars } from "../reducers/familiars";
import { reset as resetGroupMessages } from "../reducers/groupMessages";
import { resetInputStates } from "../reducers/inputs";
import { resetMessages } from "../reducers/messages";
import { resetPermissions } from "../reducers/permissions";
import { resetServers } from "../reducers/servers";
import { resetSessions } from "../reducers/sessions";
import { resetUser } from "../reducers/user";
import { gaurdian } from "../views/Base";

export function Logout(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();
    const query = useQuery();

    const logout = async () => {
        const client = window.vex;
        await client.close();

        if (query.get("clear") !== "off") {
            gaurdian.clear();
        } else {
            console.log(
                "clear set to off explicitly, keeping keys in gaurdian."
            );
        }

        dispatch(resetApp());
        dispatch(resetChannels());
        dispatch(resetFamiliars());
        dispatch(resetGroupMessages());
        dispatch(resetInputStates());
        dispatch(resetMessages());
        dispatch(resetServers());
        dispatch(resetSessions());
        dispatch(resetUser());
        dispatch(resetPermissions());

        history.push(query.get("forward") || routes.HOME);
    };

    useMemo(() => logout(), []);

    return <div />;
}
