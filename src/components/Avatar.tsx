import type { IUser } from "@vex-chat/libvex";
import type { RootState } from "~Types";

import { vexAvatarFromUUID } from "@vex-chat/avatar-generator";

import { Component } from "react";
import { connect } from "react-redux";

type Props = {
    user: IUser;
    className?: string;
    size?: number;
    hash: number;
};

type State = {
    src: string;
    loaded: boolean;
};

class Avatar extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            src: vexAvatarFromUUID(this.props.user.userID), // "https://api.vex.chat/avatar/" + props.user.userID,
            loaded: false,
        };
    }

    componentDidMount() {
        this.setState({
            src: "https://api.vex.chat/avatar/" + this.props.user.userID,
        });
    }

    onError(): void {
        this.setState({
            src: vexAvatarFromUUID(this.props.user.userID),
        });
    }

    render(): JSX.Element {
        const { src } = this.state;
        const size = this.props.size || 48;

        return (
            <span className="image">
                <img
                    className={`image is-${size.toString()}x${size.toString()} is-rounded ${
                        this.props.className || ""
                    } ${this.state.loaded ? "" : "hidden"}`}
                    src={
                        src.includes("svg")
                            ? src
                            : src + "?hash=" + this.props.hash.toString()
                    }
                    onError={this.onError.bind(this)}
                    onLoad={() => {
                        this.setState({ loaded: true });
                    }}
                />
            </span>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return { hash: state.avatarHash };
};

export default connect(mapStateToProps)(Avatar);
