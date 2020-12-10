import React from "react";
import ReactLoading from "react-loading";

export default function Loading(
    size: number,
    animation:
        | "blank"
        | "balls"
        | "bubbles"
        | "cubes"
        | "cylon"
        | "spin"
        | "spinningBubbles"
        | "spokes" = "cylon"
): JSX.Element {
    return (
        <div className="Aligner full-size">
            <div className="Aligner-item Aligner-item--top"></div>
            <div className="Aligner-item">
                <div className="">
                    <ReactLoading
                        type={animation}
                        color={`hsl(0, 0%, 96%)`}
                        height={size}
                        width={size}
                    />
                </div>
            </div>
            <div className="Aligner-item Aligner-item--bottom"></div>
        </div>
    );
}
