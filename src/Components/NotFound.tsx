import logo from "../logo.svg";
import React from "react";
import { Link } from 'react-router-dom';
import ContentThemeSapUI5 from "./ContentThemeSapUI5";
import {MessageStrip} from "@ui5/webcomponents-react";

export default function NotFound() {
    return (
        <ContentThemeSapUI5 title="Ruta Erronea">
            <MessageStrip design="Negative">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Oops! Ruta erronea.
                </p>
                <Link className="App-link" to="/">Regresar a Casa</Link>
            </MessageStrip>
        </ContentThemeSapUI5>
    )
}
