import logo from "../logo.svg";
import React from "react";
import { Link } from 'react-router-dom';
import {MessageStrip} from "@ui5/webcomponents-react";
import ContentTheme from "@/components/ContentTheme";

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
