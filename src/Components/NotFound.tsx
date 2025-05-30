import logo from "../logo.svg";
import React from "react";
import { Link } from 'react-router-dom';
import ContentTheme from "./ContentTheme";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from "react-i18next";

export default function NotFound() {
    const { t } = useTranslation();
    return (
        <ContentTheme title={t("notFound")}>
            <Alert className="border-red-200 bg-red-50 text-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-600 mx-auto mb-2" />
                <AlertDescription>
                    <img src={logo} className="App-logo mx-auto" alt="logo"/>
                    <p className="mb-2">
                        {t("notFoundMessage")}
                    </p>
                    <Link className="text-blue-600 hover:underline" to="/">
                        {t("returnToHome")}
                    </Link>
                </AlertDescription>
            </Alert>
        </ContentTheme>
    )
}
