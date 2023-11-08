import logo from "../logo.svg";
import React from "react";
import { Link } from 'react-router-dom';
import ContentTheme from "./ContentTheme";
import {MessageStrip} from "@ui5/webcomponents-react";

export default function NotFound() {
    return (
        <ContentTheme title="Ruta Erronea">
            <MessageStrip design="Negative">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Oops! Ruta erronea.
                </p>
                <Link className="App-link" to="/">Regresar a Casa</Link>
            </MessageStrip>
        </ContentTheme>
    )
}
