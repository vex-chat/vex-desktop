import { ipcRenderer } from "electron";
import { Fragment, useEffect, useState } from "react";
import ReactLoading from "react-loading";

import { formatBytes } from "../utils/formatBytes";

type UpdateDownloadProgress = {
    bytesPerSecond: number;
    percent: number;
    transferred: number;
    total: number;
};

type updateStatus = {
    status:
        | "checking"
        | "available"
        | "current"
        | "error"
        | "progress"
        | "downloaded";
    message?: string;
    data?: UpdateDownloadProgress;
};

const initialState: UpdateDownloadProgress = {
    bytesPerSecond: 0,
    percent: 0,
    transferred: 0,
    total: 0,
};

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
    errText?: string;
}): JSX.Element {
    const [progress, setProgress] = useState(initialState);

    const onDownloadProgress = (_event: Event, updateStatus: updateStatus) => {
        const { status, data } = updateStatus;
        switch (status) {
            case "progress":
                if (data) {
                    setProgress(data);
                }
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        ipcRenderer.on("autoUpdater", onDownloadProgress);
        return () => {
            ipcRenderer.off("autoUpdater", onDownloadProgress);
        };
    });

    return (
        <div className={`Aligner ${props.className || "full-size"} `}>
            <div className="Aligner-item Aligner-item--top"></div>
            <div className="Aligner-item">
                <div className="has-text-centered">
                    <ReactLoading
                        type={props.animation}
                        color={props.color || `hsl(0, 0%, 71%)`}
                        height={props.size}
                        width={props.size}
                    />
                    {progress.transferred > 0 && (
                        <Fragment>
                            <div className="help">
                                Fetching update at{" "}
                                {formatBytes(progress.bytesPerSecond)}/second.
                                Please wait.
                            </div>
                            <div className="help">
                                <progress
                                    className=""
                                    value={progress.percent.toFixed(0)}
                                    max="100"
                                ></progress>
                            </div>
                            <div className="help"></div>
                        </Fragment>
                    )}
                    <p className="has-text-danger has-text-centered">
                        {props.errText}
                    </p>
                </div>
            </div>
            <div className="Aligner-item Aligner-item--bottom has-text-centered"></div>
        </div>
    );
}
