import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, FunctionComponent, memo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { routes } from "../constants/routes";
import { addInputState } from "../reducers/inputs";
import { gaurdian } from "../views/Base";
import { BackButton } from "../components/BackButton";
import { keyFolder } from "../constants/folders";
import { VerticalAligner } from "../components/VerticalAligner";
import { useQuery } from "../hooks/useQuery";
import { useDebounce } from "../hooks/useDebounce";
import { RootState } from "../store";

const FORM_NAME = "keyfile-login-pasword";

export const Login: FunctionComponent = memo(() => {
    const history = useHistory();

    const query = useQuery();
    const password = useSelector<RootState, string>(
        ({ inputs }) => inputs[FORM_NAME]
    );
    const publicKey = query.get("key");
    const [loading, setLoading] = useState(false);
    const [errText, setErrText] = useState("");
    const dispatch = useDispatch();

    const [inputVal, setInputVal] = useState("");
    const debouncedInput = useDebounce(inputVal, 500);

    useEffect(() => {
        dispatch(addInputState(FORM_NAME, debouncedInput));
    }, [debouncedInput]);

    const unlockKey = () => {
        if (password == "") return;

        setLoading(true);
        setInputVal("");

        try {
            gaurdian.load(keyFolder + "/" + publicKey, password);
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
                        value={inputVal}
                        onChange={({ target: { value } }) => {
                            setInputVal(value);
                        }}
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
