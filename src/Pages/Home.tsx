import React, {useEffect} from "react";
import {useAuth, useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import ContentTheme from "../components/ContentTheme";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {KpiBox} from "@/components/KpiBox";
import {axiosInstance} from "@/utils/axios-instance";
import {getKpiItems, HomeInfo, KpiItem} from "@/features/home/data/home";

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
      {kpiItems.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {kpiItems.map((item) => (
              <KpiBox
                key={item.id}
                title={t(item.title)}
                value={item.value}
                icon={item.icon}
                backgroundColor={item.backgroundColor}
                iconColor={item.iconColor}
                borderColor={item.borderColor}
                route={item.route}
              />
            ))}
          </div>
          
          {/* Dashboard Strip */}
          <div className="mt-8 p-4 border-t border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboardOverview')}</h2>
            

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">{t('totalItems')}</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {kpiItems.reduce((sum, item) => sum + item.value, 0)}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">{t('activeModules')}</div>
                <div className="text-2xl font-semibold text-gray-900">{kpiItems.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">{t('warehouse')}</div>
                <div className="text-sm font-medium text-gray-900">
                  {user?.warehouses?.find(v => v.id === user?.currentWarehouse)?.name || 'N/A'}
                </div>
              </div>
            </div>
            
          </div>
        </>
      )}
      {kpiItems.length === 0 && (
        <div className="p-4">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription>
              <p className="font-semibold">{t("information")}</p>
              <p>{t("noAuthorizationOptions")}</p>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </ContentTheme>
  );
}
