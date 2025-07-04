import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {useRef, useState} from "react";
import {PackageScannerRef} from "@/components/PackageScanner";
import {useAuth} from "@/components/AppContext";
import {PackageDto} from "@/pages/packages/types";
import {getPackageByBarcode} from "@/pages/packages/hooks";
import {exportToExcel} from "@/utils/excelExport";
import {formatQuantityForExcel} from "@/utils/excel-quantity-format";

export const usePackageCheckData = () => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const packageRef = useRef<PackageScannerRef>(null);
  const {user} = useAuth();
  const [packageData, setPackageData] = useState<PackageDto | null>(null);

  function onScan(packageData: PackageDto) {
    setPackageData(packageData);
  }

  function onPackageClear() {
    setPackageData(null);
    setTimeout(() => {
      packageRef?.current?.focus();
    }, 1);
  }

  async function refreshPackageData() {
    if (!packageData) return;
    
    setLoading(true);
    try {
      const result = await getPackageByBarcode(packageData.barcode, {
        contents: true,
        details: true
      });
      
      if (result) {
        setPackageData(result);
      } else {
        setError(new Error(t('packages.packageNotFound')));
      }
    } catch (error: any) {
      // Check if it's a 404 error (package not found)
      if (error?.response?.status === 404) {
        setError(new Error(t('packages.packageNotFound')));
      } else {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  }

  const excelData = () => {
    if (!packageData?.contents) return [];
    
    return packageData.contents.map((content) => {
      const quantities = formatQuantityForExcel({
        quantity: content.quantity,
        numInBuy: 1, // Package content doesn't have these fields, using defaults
        buyUnitMsr: content.unitType,
        purPackUn: 1,
        purPackMsr: content.unitType
      });
      
      return [
        content.itemCode,
        content.itemName || '',
        content.quantity,
        content.unitType,
        content.binCode || '',
        content.whsCode,
        new Date(content.createdAt).toLocaleDateString(),
        content.createdBy
      ];
    });
  };

  const excelHeaders = [
    t("code"),
    t("itemName"),
    t("quantity"),
    t("unitType"),
    t("binCode"),
    t("whsCode"),
    t("createdAt"),
    t("createdBy")
  ];

  const handleExportExcel = () => {
    if (!packageData) return;
    
    exportToExcel({
      name: "PackageCheck",
      headers: excelHeaders,
      getData: excelData,
      fileName: `packagecheck_${packageData.barcode}`
    });
  };

  return {
    setLoading,
    setError,
    packageRef,
    user,
    packageData,
    setPackageData,
    onScan,
    onPackageClear,
    refreshPackageData,
    excelData,
    excelHeaders,
    handleExportExcel
  };
};