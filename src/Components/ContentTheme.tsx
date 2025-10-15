import React from "react";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/AppSidebar";
import {Button} from "@/components/ui";
import {FileSpreadsheet, Filter, Plus} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useAuth} from "@/components/AppContext";
import {NotificationBell} from "@/components/NotificationBell";
import DeviceStatusBanner from "@/components/DeviceStatusBanner";
import AccountStatusBanner from "@/components/AccountStatusBanner";
import {DeviceStatus} from "@/features/devices/data/device";
import {AccountState} from "@/features/account/data/account";
import {ResponsiveBreadcrumbs, BreadcrumbItem} from "@/components/ui/responsive-breadcrumbs";

interface ContentThemeProps {
  title: string;
  titleOnClick?: () => void;
  titleBreadcrumbs?: BreadcrumbItem[];
  onExportExcel?: () => void;
  onFilterClicked?: () => void;
  onAdd?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const ContentTheme: React.FC<ContentThemeProps> = (
  {
    title,
    titleOnClick,
    titleBreadcrumbs,
    children,
    footer,
    onExportExcel,
    onAdd,
    onFilterClicked,
  }) => {
  const {t} = useTranslation();
  const { user, companyInfo, showDeviceStatusBanner, setShowDeviceStatusBanner } = useAuth();

  const shouldShowDeviceStatusBanner = () => {
    if (!user || !user.deviceStatus || !showDeviceStatusBanner) return false;
    return user.deviceStatus === DeviceStatus.Inactive || user.deviceStatus === DeviceStatus.Disabled;
  };

  const shouldShowAccountStatusBanner = () => {
    if (!companyInfo?.accountStatus) return false;
    const invalidStates = [
      AccountState.Invalid,
      AccountState.PaymentDue,
      AccountState.PaymentDueUnknown,
      AccountState.Demo,
      AccountState.DemoExpired,
      AccountState.Disabled
    ];
    return invalidStates.includes(companyInfo.accountStatus);
  };

  return (
    <SidebarProvider>
      <div className="h-dvh flex w-full text-base md:text-lg">
        <AppSidebar/>

        <div className="flex flex-col flex-1 min-w-0">
          {/* Header: responsive height */}
          <header className="flex items-center justify-between min-h-[3.5rem] md:min-h-[4rem] py-2 px-3 md:px-6 bg-white border-b border-gray-200 flex-shrink-0 z-10 w-full">
            <div className="flex items-center gap-2 md:gap-4 flex-1">
              <SidebarTrigger className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg transition-colors hover:bg-gray-100"/>
              <div className="flex-1 min-w-0 overflow-hidden">
                <ResponsiveBreadcrumbs
                  homeLabel={title}
                  onHomeClick={titleOnClick}
                  items={titleBreadcrumbs || []}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center flex-shrink-0 gap-1 md:gap-2 ml-2 md:ml-4">
              <NotificationBell />
              {onFilterClicked && (
                <button
                  onClick={onFilterClicked}
                  className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Filter"
                >
                  <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </button>
              )}
              {onAdd && (
                <Button type="button" variant="outline" size="sm" onClick={onAdd} className="h-9 md:h-10 font-normal focus:outline-none focus:ring-2 focus:ring-blue-600 px-2 md:px-3">
                  <Plus className="mr-1 md:mr-2 h-4 w-4"/>
                  <span className="hidden sm:inline">{t('add')}</span>
                </Button>
              )}
              {onExportExcel && (
                <button
                  onClick={onExportExcel}
                  className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Export to Excel"
                >
                  <FileSpreadsheet className="h-4 w-4 md:h-5 md:w-5 text-green-600"/>
                </button>
              )}
            </div>
          </header>

          {/* Account Status Banner */}
          {shouldShowAccountStatusBanner() && (
            <div className="w-full">
              <AccountStatusBanner
                accountStatus={companyInfo!.accountStatus!}
                className="w-full"
              />
            </div>
          )}

          {/* Device Status Banner */}
          {shouldShowDeviceStatusBanner() && (
            <div className="w-full">
              <DeviceStatusBanner
                deviceStatus={user!.deviceStatus!}
                onClose={() => setShowDeviceStatusBanner(false)}
                allowActivation={user?.superUser || false}
              />
            </div>
          )}

          {/* Scrollable content */}
          <main className="flex-1 overflow-auto p-0 md:p-2 md:py-4 w-full min-w-0">
            <div className="w-full min-w-0">
              {children}
            </div>
          </main>

          {/* Footer: fixed height */}
          {footer && (
            <footer className="flex-shrink-0 bg-white w-full border-t-1">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

export default ContentTheme;
