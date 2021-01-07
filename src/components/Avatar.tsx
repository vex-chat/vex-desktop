import type { IUser } from "@vex-chat/libvex";

import { Component } from "react";

import { strToIcon } from "../utils/strToIcon";

type Props = {
    user: IUser;
    className?: string;
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
        return (
            <img
                className={`is-rounded ${this.props.className || ""} ${
                    this.state.loaded ? "" : "hidden"
                }`}
                src={src}
                onError={this.onError.bind(this)}
                onLoad={() => {
                    this.setState({ loaded: true });
                }}
            />
        );
    }
}