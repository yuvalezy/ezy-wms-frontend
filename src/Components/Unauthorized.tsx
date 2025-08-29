import React from "react";
import { Link, useSearchParams } from 'react-router';
import ContentTheme from "@/components/ContentTheme";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import {useAuth} from "@/components/AppContext";
import {DeviceStatus} from "@/features/devices/data/device";

export default function Unauthorized() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const errorCode = searchParams.get('errorCode');
    const {user} = useAuth();
    
    const getErrorMessage = () => {
        switch (errorCode) {
            case '401':
                return t("unauthorizedMessage401") || "Your session has expired. Please log in again.";
            case '403':
                return t("unauthorizedMessage403") || "You don't have permission to access this resource.";
            default:
                return t("unauthorizedMessage") || "You are not authorized to access this resource.";
        }
    };
    
    return (
        <ContentTheme title={t("unauthorized")}>
            <div className="flex justify-center items-center h-full">
                <Card className="w-full max-w-md p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">{t("unauthorized")}</h2>
                    <p className="mb-4">
                        {getErrorMessage()}
                    </p>
                    {user?.deviceStatus === DeviceStatus.Active &&
                      <Link className="text-blue-600 hover:underline" to="/">
                        {t("returnToHome")}
                    </Link>}
                </Card>
            </div>
        </ContentTheme>
    )
}
