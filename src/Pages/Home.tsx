import React from "react";
import {useAuth} from "@/components";
import {useTranslation} from "react-i18next";
import ContentTheme from "../components/ContentTheme";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KpiBox } from "@/components/KpiBox";
import { getKpiItems } from "@/assets/KpiData";

const kpiColors = [
    { background: "bg-blue-100", icon: "text-blue-700" },
    { background: "bg-green-100", icon: "text-green-700" },
    { background: "bg-gray-100", icon: "text-gray-700" },
    { background: "bg-indigo-100", icon: "text-indigo-700" },
    { background: "bg-teal-100", icon: "text-teal-700" },
    { background: "bg-cyan-100", icon: "text-cyan-700" },
    { background: "bg-lime-100", icon: "text-lime-700" },
    { background: "bg-blue-gray-100", icon: "text-blue-gray-700" },
];

export default function Home() {
    const {user} = useAuth();
    const {t} = useTranslation();
    const kpiItems = getKpiItems(user?.authorizations);

    return (
      <ContentTheme title={t('home')}>
            {kpiItems.length > 0 &&
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 mt-4">
                    {kpiItems.map((item, index) => (
                        <KpiBox
                            key={item.id}
                            title={t(item.title)}
                            value={item.value}
                            icon={item.icon}
                            backgroundColor={kpiColors[index % kpiColors.length].background}
                            iconColor={kpiColors[index % kpiColors.length].icon}
                        />
                    ))}
                </div>
            }
            {kpiItems.length === 0 &&
                <div className="p-4">
                    <Alert className="border-blue-200 bg-blue-50">
                        <AlertDescription>
                            <p className="font-bold">{t("information")}</p>
                            <p>{t("noAuthorizationOptions")}</p>
                        </AlertDescription>
                    </Alert>
                </div>
            }
        </ContentTheme>
    );
}
