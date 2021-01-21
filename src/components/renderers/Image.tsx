import React, { Component } from "react";

type State = {
    previewOpen: boolean;
};

type Props = {
    src: string;
    alt: string;
};

export class ImageRenderer extends Component<Props, State> {
    render(): JSX.Element {
        return (
            <img src={this.props.src} alt={this.props.alt} className="emoji" />
        );
    }
}
