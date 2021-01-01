import React from "react";
import { useHistory } from "react-router";

export function BackButton(props: { route?: string }): JSX.Element {
    const history = useHistory();
    return (
        <a
            className="delete settings-delete is-medium"
            onClick={() => {
                if (props.route) {
                    history.push(props.route);
                } else {
                    history.goBack();
                }
            }}
        />
    );
}
