import React from "react";
import {Link, useNavigate, useSearchParams} from 'react-router';
import ContentTheme from "@/components/ContentTheme";
import {Card} from "@/components/ui/card";
import {useTranslation} from "react-i18next";
import {useAuth} from "@/components/AppContext";
import {DeviceStatus} from "@/features/devices/data/device";
import {Button} from "@/components/ui/button";

export default function Unauthorized() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const errorCode = searchParams.get('errorCode');
    const {user, refreshSession} = useAuth();
    
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

    const handleRetrySession = async () => {
        const restored = await refreshSession();
        if (restored) {
            navigate(searchParams.get('returnUrl') || '/');
        } else {
            navigate('/login?reason=session-expired');
        }
    };

    if (errorCode === '401') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">{t("unauthorized")}</h2>
                    <p className="mb-6">{getErrorMessage()}</p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={handleRetrySession}>
                            {t('retry') || 'Retry'}
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/login?reason=session-expired')}>
                            {t('login') || 'Login'}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }
    
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
