import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";
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
                        <div>
                            Fetching update. Please wait.
                            <br />
                            {progress.percent}%{" "}
                            {formatBytes(progress.bytesPerSecond)}/sec
                        </div>
                    )}
                </div>
            </div>
            <div className="Aligner-item Aligner-item--bottom has-text-centered"></div>
        </div>
    );
}
