import React from "react";
import ReactLoading from "react-loading";

export default function Loading(props: {
    size: number;
    animation:
        | "blank"
        | "balls"
        | "bubbles"
        | "cubes"
        | "cylon"
        | "spin"
        | "spinningBubbles"
        | "spokes";
}): JSX.Element {
    return (
        <div className="Aligner full-size">
            <div className="Aligner-item Aligner-item--top"></div>
            <div className="Aligner-item">
                <div className="">
                    <ReactLoading
                        type={props.animation}
                        color={`hsl(0, 0%, 71%)`}
                        height={props.size}
                        width={props.size}
                    />
                </div>
            </div>
            <div className="Aligner-item Aligner-item--bottom"></div>
        </div>
    );
}
