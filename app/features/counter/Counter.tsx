import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import routes from "../../constants/routes.json";
import {
    increment,
    decrement,
    incrementIfOdd,
    incrementAsync,
    selectCount,
} from "./counterSlice";

export default function Counter(): JSX.Element {
    const dispatch = useDispatch();
    const value = useSelector(selectCount);
    return (
        <div className="view">
            <div className="container">
                <h1 className="title">Counter</h1>
                <div>
                    <Link to={routes.HOME}>Back Home</Link>
                </div>
                <br />
                <h1 className="title">{value}</h1>
                <div className="buttons">
                    <button
                        onClick={() => {
                            dispatch(increment());
                        }}
                        className="button"
                    >
                        Increment
                    </button>
                    <button
                        onClick={() => {
                            dispatch(decrement());
                        }}
                        className="button"
                    >
                        Decrement
                    </button>
                    <button
                        onClick={() => {
                            dispatch(incrementIfOdd());
                        }}
                        className="button"
                    >
                        odd
                    </button>
                    <button
                        onClick={() => {
                            dispatch(incrementAsync());
                        }}
                        className="button"
                    >
                        async
                    </button>
                </div>
            </div>
        </div>
    );
}
