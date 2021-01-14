import ReactLoading from "react-loading";

export default function Loading(props: {
    size: number;
    animation:
        | "blank"
        | "bars"
        | "balls"
        | "bubbles"
        | "cubes"
        | "cylon"
        | "spin"
        | "spinningBubbles"
        | "spokes";
    color?: string;
    className?: string;
}): JSX.Element {
    return (
        <div className={`Aligner ${props.className || "full-size"} `}>
            <div className="Aligner-item Aligner-item--top"></div>
            <div className="Aligner-item">
                <div className="">
                    <ReactLoading
                        type={props.animation}
                        color={props.color || `hsl(0, 0%, 71%)`}
                        height={props.size}
                        width={props.size}
                    />
                </div>
            </div>
            <div className="Aligner-item Aligner-item--bottom"></div>
        </div>
    );
}
