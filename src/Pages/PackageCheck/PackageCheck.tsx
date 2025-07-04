import React from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import PackageScanner from "../../components/PackageScanner";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle} from 'lucide-react';
import {usePackageCheckData} from "./package-check-data";
import {PackageCheckResult} from "./PackageCheckResult";

export function PackageCheck() {
  const {t} = useTranslation();
  const {
    packageData,
    packageRef,
    user,
    onScan,
    onPackageClear,
    handleExportExcel
  } = usePackageCheckData();

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
      titleOnClick={packageData ? () => onPackageClear() : undefined}
      titleBreadcrumbs={packageData ? [{label: packageData.barcode}] : undefined}
      onExportExcel={packageData ? handleExportExcel : undefined}
    >
      <div className="space-y-4">
        {packageData && <PackageCheckResult packageData={packageData} />}
        {!packageData && (
          <PackageScanner 
            ref={packageRef} 
            onScan={onScan} 
            onClear={onPackageClear}
            label={t("packages.scanPackageBarcode")}
          />
        )}
      </div>
    </ContentTheme>
  );
}