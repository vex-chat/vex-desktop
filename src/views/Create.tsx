import React from "react";
import { useParams } from "react-router";
import { CreateServer } from "../components/CreateServer";

export function Create(): JSX.Element {
    const params: { resourceType: string } = useParams();

    switch (params.resourceType) {
        case "server":
            return <CreateServer />;
        default:
            console.warn(
                "Unsupported resource type for create route" +
                    params.resourceType
            );
            return <span />;
    }
}
