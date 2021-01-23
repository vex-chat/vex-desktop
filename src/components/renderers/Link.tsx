import { shell } from "electron";
import React, { Component } from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
type State = {};

type Props = {
    target: string;
    href: string;
    children: React.ReactNodeArray;
};

export class LinkRenderer extends Component<Props, State> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render(): JSX.Element {
        return (
            <a
                className="has-text-link"
                rel="noopener noreferrer"
                onClick={() => {
                    // hacky but to get around bug in magnet link parsing
                    const url = (this.props as any).children[0]?.props
                        .children as string | undefined;
                    shell.openExternal(url || this.props.href);
                }}
                target={this.props.target}
            >
                {this.props.children}
            </a>
        );
    }
}
