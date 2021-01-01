import React, { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export default function App(props: Props): JSX.Element {
    const { children } = props;
    return <>{children}</>;
}
