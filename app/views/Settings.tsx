import React from "react";
import { useHistory } from "react-router";

export default function Settings(): JSX.Element {
    const history = useHistory();

    return (
        <div className="Aligner full-size">
            <div className="Aligner-item Aligner-item--top">
                <a
                    className="delete settings-delete is-large"
                    onClick={() => {
                        history.goBack();
                    }}
                ></a>
            </div>
            <div className="Aligner-item">HELLO</div>
            <div className="Aligner-item Aligner-item--bottom"></div>
        </div>
    );
}
