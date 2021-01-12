import type { IUser } from "@vex-chat/libvex";

import { Component } from "react";

import { strToIcon } from "../utils/strToIcon";

type Props = {
    user: IUser;
    className?: string;
    size?: number;
};

type State = {
    src: string;
    loaded: boolean;
};

export class Avatar extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            src: "https://api.vex.chat/avatar/" + props.user.userID,
            loaded: false,
        };
    }

    onError(): void {
        this.setState({
            src: strToIcon(this.props.user.username),
        });
    }

    render(): JSX.Element {
        const { src } = this.state;
        const size = this.props.size || 48;

        return (
            <div className="image">
                <img
                    className={`image is-${size.toString()}x${size.toString()} is-rounded ${
                        this.props.className || ""
                    } ${this.state.loaded ? "" : "hidden"}`}
                    src={src}
                    onError={this.onError.bind(this)}
                    onLoad={() => {
                        this.setState({ loaded: true });
                    }}
                />
            </div>
        );
    }
}
