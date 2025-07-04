import React, {useEffect} from "react";
import {useAuth, useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import ContentTheme from "../components/ContentTheme";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {KpiBox} from "@/components/KpiBox";
import {getKpiItems, KpiItem} from "@/assets/KpiData";
import {HomeInfo} from "@/assets/HomeInfo";
import {axiosInstance} from "@/utils/axios-instance";



export default function Home() {
  const {user} = useAuth();
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const [kpiItems, setKpiItems] = React.useState<KpiItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const response = await axiosInstance.get<HomeInfo>(`General/HomeInfo`);
        setKpiItems(getKpiItems(user?.roles, response.data));
      } catch (error) {
        console.error(`Failed to home info: ${error}`);
        setError(error);
      } finally {
        setLoading(false)
      }
    };
    fetchData();
  }, []);

  return (
    <ContentTheme title={t('home')}>
      {kpiItems.length > 0 &&
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 mt-4">
            {kpiItems.map((item) => (
              <KpiBox
                key={item.id}
                title={t(item.title)}
                value={item.value}
                icon={item.icon}
                backgroundColor={item.backgroundColor}
                iconColor={item.iconColor}
                route={item.route}
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
