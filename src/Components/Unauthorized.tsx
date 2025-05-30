import React from "react";
import { Link } from 'react-router-dom';
import ContentTheme from "@/components/ContentTheme";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function Unauthorized() {
    const { t } = useTranslation();
    return (
        <ContentTheme title={t("unauthorized")}>
            <div className="flex justify-center items-center h-full">
                <Card className="w-full max-w-md p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">{t("unauthorized")}</h2>
                    <p className="mb-4">
                        {t("unauthorizedMessage")}
                    </p>
                    <Link className="text-blue-600 hover:underline" to="/">
                        {t("returnToHome")}
                    </Link>
                </Card>
            </div>
        </ContentTheme>
    )
}
