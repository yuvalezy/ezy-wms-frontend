import logo from "../logo.svg";
import React from "react";
import Menu from "../Components/Menu";

export default function GoodsReceipt() {
    /*
    if (user.authorizations.includes(Authorization.WRITE)) {
    // User has write authorization
}
     */
    return (
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <p>
                Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                Learn React
            </a>
            <Menu />
        </header>
    )
}