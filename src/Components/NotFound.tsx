import logo from "../logo.svg";
import React from "react";
import { Link } from 'react-router-dom';
import ContentTheme from "./ContentTheme";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
    return (
        <ContentTheme title="Ruta Erronea">
            <Alert className="border-red-200 bg-red-50 text-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-600 mx-auto mb-2" />
                <AlertDescription>
                    <img src={logo} className="App-logo mx-auto" alt="logo"/>
                    <p className="mb-2">
                        Oops! Ruta erronea.
                    </p>
                    <Link className="text-blue-600 hover:underline" to="/">Regresar a Casa</Link>
                </AlertDescription>
            </Alert>
        </ContentTheme>
    )
}
