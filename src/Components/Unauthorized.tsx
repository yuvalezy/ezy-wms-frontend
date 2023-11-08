import logo from "../logo.svg";
import React from "react";
import { Link } from 'react-router-dom';
import ContentTheme from "./ContentTheme";
import {MessageStrip} from "@ui5/webcomponents-react";

export default function Unauthorized() {
    return (
        <ContentTheme title="Unauthorized">
            <MessageStrip design="Negative">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Oops! You're not authorized to view this page.
                </p>
                <Link className="App-link" to="/">Return to Home</Link>
            </MessageStrip>
        </ContentTheme>
    )
}
