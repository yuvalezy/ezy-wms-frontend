import logo from "./logo.svg";
import React from "react";
import {useAuth} from "./AppContext";

export default function Home() {
    const {logout} = useAuth();
    function handleLogout() {
        logout();
    }

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
            <button onClick={handleLogout}>Logout</button>
        </header>
    )
}