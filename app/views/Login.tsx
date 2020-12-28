import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, ChangeEvent, FunctionComponent, memo } from "react";
import { useHistory } from "react-router";

import { routes } from "../constants/routes";
import { gaurdian } from "../views/Base";
import { BackButton } from "../components/BackButton";
import { keyFolder } from "../constants/folders";
import { VerticalAligner } from "../components/VerticalAligner";
import { useQuery } from "../hooks/useQuery";
import { useDebounce } from "../hooks/useDebounce";

export const Login: FunctionComponent = memo(() => {
    const history = useHistory();
    const query = useQuery();
    const [loading, setLoading] = useState(false);
    const [errText, setErrText] = useState("");

    const publicKey = query.get("key");

    const [debouncedVal, setDebounced] = useDebounce("", 1000);
    const onChange = ({target: {value}}: ChangeEvent<HTMLInputElement>) => {
        setDebounced(value);
    }

    const unlockKey = () => {
        if (debouncedVal == "") return

        setLoading(true);
        setDebounced("");

        try {
            gaurdian.load(keyFolder + "/" + publicKey, debouncedVal);
        } catch (err) {
            console.error(err);
            setErrText(err.toString());
            setLoading(false);
            return;
        }

        history.push(routes.HOME);
    };

    return (
        <VerticalAligner top={<BackButton route={routes.HOME} />}>
            <div className="box">
                {errText !== "" && (
                    <div className="notification is-danger">{errText}</div>
                )}
                <label className="label is-small">Password:</label>
                <div className="control input-wrapper has-icons-left has-icons-right">
                    <input
                        className="input"
                        type="password"
                        placeholder="hunter2"
                        value={debouncedVal}
                        onChange={onChange}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                unlockKey();
                            }
                        }}
                    />
                    <span className="icon is-left">
                        <FontAwesomeIcon icon={faLock} />
                    </span>
                </div>
                <div className="buttons is-right">
                    <button
                        className={`button is-success ${
                            loading ? "is-loading" : ""
                        }`}
                        onClick={unlockKey}
                    >
                        Unlock
                    </button>
                </div>
            </div>
        </VerticalAligner>
    );
});