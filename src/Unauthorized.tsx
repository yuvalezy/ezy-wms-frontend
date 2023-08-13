import logo from "./logo.svg";
import React from "react";

export default function Unauthorized() {
    return (
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <p>
                Oops! You're not authorized to view this page.
            </p>
            <a className="App-link" href="/"> Return Home </a>
        </header>
    )
}
