import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {useRef, useState, useCallback} from "react";
import {PackageScannerRef} from "@/components/PackageScanner";
import {useAuth} from "@/components/AppContext";
import {PackageDto} from "@/features/packages/types";
import {getPackageByBarcode} from "@/features/packages/hooks";
import {exportToExcel} from "@/utils/excelExport";
import {formatQuantityForExcel, getExcelQuantityHeaders, getExcelQuantityValuesFromResult} from "@/utils/excel-quantity-format";

export const usePackageCheckData = () => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const packageRef = useRef<PackageScannerRef>(null);
  const {user} = useAuth();
  const [packageData, setPackageData] = useState<PackageDto | null>(null);
  const [isCheckingPackage, setIsCheckingPackage] = useState(false);
  const [isRefreshingPackage, setIsRefreshingPackage] = useState(false);

  const onScan = useCallback((packageData: PackageDto) => {
    setPackageData(packageData);
  }, []);

  const executePackageCheck = useCallback(async (id: string, barcode: string) => {
    setIsCheckingPackage(true);
    try {
      const result = await getPackageByBarcode({
        barcode,
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
      setIsCheckingPackage(false);
    }
  }, [setError, t]);

  function onPackageClear() {
    setPackageData(null);
    setTimeout(() => {
      packageRef?.current?.focus();
    }, 1);
  }

  async function refreshPackageData() {
    if (!packageData) return;

    setIsRefreshingPackage(true);
    try {
      const result = await getPackageByBarcode({
        barcode: packageData.barcode,
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
      setIsRefreshingPackage(false);
    }
  }

  // getData: () => (string | number)[][];

  const excelData = (): (string | number)[][] => {
    if (!packageData?.contents) return [];

    return packageData.contents.map((content) => {
      const quantities = formatQuantityForExcel({
        quantity: content.quantity,
        numInBuy: content.itemData?.quantityInUnit || 1,
        purPackUn: content.itemData?.quantityInPack || 1,
      });

      return [
        content.itemCode,
        content.itemData?.itemName || '',
        ...getExcelQuantityValuesFromResult(quantities, user?.settings.enableUseBaseUn),
        content.unitType,
        content.binCode || '',
        content.whsCode,
        new Date(content.createdAt).toLocaleDateString(),
        content.createdBy?.name || ''
      ];
    });
  };

  const excelHeaders = [
    t("code"),
    t("itemName"),
    ...getExcelQuantityHeaders(t, true, user?.settings.enableUseBaseUn),
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
    isCheckingPackage,
    isRefreshingPackage,
    onScan,
    onPackageClear,
    refreshPackageData,
    excelData,
    excelHeaders,
    handleExportExcel,
    executePackageCheck
  };
};