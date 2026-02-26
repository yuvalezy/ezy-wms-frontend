import React from "react";
import {Link} from 'react-router';
import ContentTheme from "./ContentTheme";
import {Card} from "@/components/ui/card";
import {useTranslation} from "react-i18next";

export default function NotFound() {
    const { t } = useTranslation();
    return (
        <ContentTheme title={t("notFound")}>
            <div className="flex justify-center items-center h-full">
                <Card className="w-full max-w-md p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">{t("notFound")}</h2>
                    <p className="mb-4">
                        {t("notFoundMessage")}
                    </p>
                    <Link className="text-blue-600 hover:underline" to="/">
                        {t("returnToHome")}
                    </Link>
                </Card>
            </div>
        </ContentTheme>
    )
}
