import * as React from "react";

export function VerticalAligner(props: {
    top?: JSX.Element;
    bottom?: JSX.Element;
    children: React.ReactNode;
}): JSX.Element {
    return (
        <div className="Aligner full-size">
            <div className="Aligner-item Aligner-item--top">
                {props.top ? props.top : <span />}
            </div>
            <div className="Aligner-item">{props.children}</div>
            <div className="Aligner-item Aligner-item--bottom">
                {props.bottom ? props.bottom : <span />}
            </div>
        </div>
    );
}
