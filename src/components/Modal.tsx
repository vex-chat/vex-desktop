export function Modal(props: {
    children: JSX.Element;
    active: boolean;
    onAccept?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
    cancelText?: string;
    acceptText?: string;
    close: () => void;
}): JSX.Element {
    return (
        <div className={`modal ${props.active ? "is-active" : ""}`}>
            <div
                className="modal-background"
                onClick={() => {
                    props.close();
                }}
            ></div>
            <div className="modal-content box">
                {props.children}
                <br />
                <div className="buttons is-right">
                    {props.showCancel && (
                        <button
                            className="button is-plain"
                            onClick={() => {
                                if (props.onCancel) {
                                    props.onCancel();
                                }
                                props.close();
                            }}
                        >
                            {props.cancelText || "Cancel"}
                        </button>
                    )}

                    <button
                        className="button is-success"
                        onClick={() => {
                            if (props.onAccept) {
                                props.onAccept();
                            }
                            props.close();
                        }}
                    >
                        {props.acceptText || "OK"}
                    </button>
                </div>
            </div>
            <button
                className="modal-close is-large"
                aria-label="close"
                onClick={() => {
                    props.close();
                }}
            ></button>
        </div>
    );
}
