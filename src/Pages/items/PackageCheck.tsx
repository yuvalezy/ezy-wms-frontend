import React, { useEffect } from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import PackageScanner from "../../components/PackageScanner";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle} from 'lucide-react';
import {usePackageCheckData} from "../../features/items/hooks/usePackageCheckData";
import {PackageCheckResult} from "../../features/items/components/PackageCheckResult";
import {PackageCheckFormSkeleton} from "../../features/items/components/PackageCheckFormSkeleton";
import {PackageCheckResultSkeleton} from "../../features/items/components/PackageCheckResultSkeleton";
import {useParams, useNavigate} from "react-router";

export function PackageCheck() {
  const {t} = useTranslation();
  const { id, barcode } = useParams();
  const navigate = useNavigate();
  
  const {
    packageData,
    packageRef,
    user,
    isCheckingPackage,
    isRefreshingPackage,
    onScan,
    onPackageClear,
    handleExportExcel,
    executePackageCheck
  } = usePackageCheckData();

  useEffect(() => {
    if (id && barcode && !packageData) {
      executePackageCheck(id, barcode);
    }
  }, [id, barcode, executePackageCheck, packageData]);

  const handleClearAndNavigate = () => {
    onPackageClear();
    navigate('/packageCheck');
  };

  const handleScanAndNavigate = (packageData: any) => {
    navigate(`/packageCheck/${packageData.id}/${packageData.barcode}`);
  };

  // Note: For now, we'll allow all users to access package check
  // In the future, this could be restricted based on user permissions
  // if (!user?.somePackagePermission) return (
  //   <ContentTheme title={t("packages.packageCheck")}>
  //     <Alert className="border-red-200 bg-red-50">
  //       <AlertTriangle className="h-4 w-4 text-red-600"/>
  //       <AlertDescription>
  //         You don't have permission to check packages.
  //       </AlertDescription>
  //     </Alert>
  //   </ContentTheme>
  // )

  return (
    <ContentTheme 
      title={t("packages.packageCheck")}
      titleOnClick={packageData ? handleClearAndNavigate : undefined}
      titleBreadcrumbs={packageData ? [{label: packageData.barcode}] : undefined}
      onExportExcel={packageData ? handleExportExcel : undefined}
    >
      <div className="space-y-4 px-3 pt-3 md:px-0 md:pt-0">
        {/* Show result skeleton while refreshing existing package data */}
        {packageData && isRefreshingPackage && <PackageCheckResultSkeleton />}
        
        {/* Show actual result when package data is loaded and not refreshing */}
        {packageData && !isRefreshingPackage && <PackageCheckResult packageData={packageData} />}
        
        {/* Show form skeleton when checking package (URL params case) */}
        {!packageData && isCheckingPackage && <PackageCheckFormSkeleton />}
        
        {/* Show form when no package data and not checking */}
        {!packageData && !isCheckingPackage && (
          <PackageScanner 
            ref={packageRef} 
            onScan={handleScanAndNavigate} 
            onClear={handleClearAndNavigate}
            label={t("packages.scanPackageBarcode")}
          />
        )}
      </div>
    </ContentTheme>
  );
}