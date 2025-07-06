import React, {useEffect} from "react";
import {useAuth, useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import ContentTheme from "../components/ContentTheme";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {KpiBox} from "@/components/KpiBox";
import {getKpiItems, KpiItem} from "@/assets/KpiData";
import {HomeInfo} from "@/assets/HomeInfo";
import {axiosInstance} from "@/utils/axios-instance";
import {FeatureGuard} from "@/components/access";
import {useLicenseStatus} from "@/hooks/useLicenseStatus";

export default function Home() {
  const {user} = useAuth();
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const [kpiItems, setKpiItems] = React.useState<KpiItem[]>([]);
  const licenseStatus = useLicenseStatus();

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
            
            {/* License Status Banner */}
            {licenseStatus.needsAttention && (
              <div className="mb-4">
                <Alert className={`border-${licenseStatus.statusColor}-200 bg-${licenseStatus.statusColor}-50`}>
                  <AlertDescription className={`text-${licenseStatus.statusColor}-800`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">License Status: {licenseStatus.statusMessage}</p>
                        {licenseStatus.gracePeriodDays && (
                          <p className="text-sm mt-1">Grace period: {licenseStatus.gracePeriodDays} days remaining</p>
                        )}
                      </div>
                      {licenseStatus.isPaymentDue && (
                        <button 
                          onClick={() => window.open('/billing', '_blank')}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Update Payment
                        </button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
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
            
            {/* Advanced Features Section - Protected by Access Control */}
            <FeatureGuard featureName="ADVANCED_REPORTING" className="mt-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-md font-semibold text-gray-900 mb-2">Advanced Features</h3>
                <p className="text-sm text-gray-600">Access to advanced reporting and analytics.</p>
              </div>
            </FeatureGuard>
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
