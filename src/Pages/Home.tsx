import React, {useEffect} from "react";
import {useAuth, useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import ContentTheme from "../components/ContentTheme";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {KpiBox} from "@/components/KpiBox";
import {axiosInstance} from "@/utils/axios-instance";
import {getKpiItems, HomeInfo, KpiItem} from "@/features/home/data/home";
import {HomeIcon} from "lucide-react";

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
        setKpiItems(getKpiItems(user!.settings, user!.roles, response.data));
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6 px-2 md:px-6 py-3 md:py-6">
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
          
          {/* Dashboard Summary */}
          <div className="mx-2 md:mx-6 mt-3 md:mt-6 p-3 md:p-6 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">{t('dashboardOverview')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white p-4 md:p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-600">{t('totalItems')}</div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {kpiItems.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Across all modules</div>
              </div>
              <div className="bg-white p-4 md:p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-600">{t('activeModules')}</div>
                  <div className="h-2 w-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform"></div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{kpiItems.length}</div>
                <div className="text-xs text-gray-500 mt-1">Authorized for user</div>
              </div>
              <div className="bg-white p-4 md:p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-600">{t('warehouse')}</div>
                  <div className="h-2 w-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
                </div>
                <div className="text-base md:text-lg font-semibold text-gray-900 truncate">
                  {user?.warehouses?.find(v => v.id === user?.currentWarehouse)?.name || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Current location</div>
              </div>
            </div>
            
          </div>
        </>
      )}
      {kpiItems.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 md:p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <HomeIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("information")}</h3>
            <p className="text-gray-600 mb-6">{t("noAuthorizationOptions")}</p>
            <Alert className="border-blue-200 bg-blue-50 text-left">
              <AlertDescription className="text-sm text-blue-700">
                Contact your administrator to request access to warehouse modules.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </ContentTheme>
  );
}
