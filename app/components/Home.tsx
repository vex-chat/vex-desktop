import React from "react";
import { Link } from "react-router-dom";
import routes from "../constants/routes.json";

export default function Home(): JSX.Element {
    return (
        <div className="view">
            <div className="container">
                <h2 className="title">Home</h2>
                <Link to={routes.COUNTER}>to Counter</Link>
            </div>
        </div>
    );
}
