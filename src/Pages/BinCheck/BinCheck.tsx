import React from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import BinLocationScanner from "../../components/BinLocationScanner";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {useBinCheckData} from "@/pages/BinCheck/bin-check-data";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import {BinCheckResult} from "@/pages/BinCheck/BinCheckResult";

export function BinCheck() {
  const {t} = useTranslation();
  const {
    bin,
    binRef,
    user,
    binContent,
    onScan,
    onBinClear,
    handleExportExcel
  } = useBinCheckData();

  if (!user?.binLocations) return (
    <ContentTheme title={t("binCheck")}>
      <Alert className="border-red-200 bg-red-50">
        <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-600"/>
        <AlertDescription>
          You're not connected to a bin managed warehouse.
        </AlertDescription>
      </Alert>
    </ContentTheme>
  )

  return <ContentTheme title={t("binCheck")}
                       titleOnClick={binContent != null ? () => onBinClear() : undefined}
                       titleBreadcrumbs={binContent ? [{label: bin!.code}] : undefined}
                       exportExcel={binContent != null}
                       onExportExcel={handleExportExcel}
  >
    <div className="space-y-4">
      {binContent && <BinCheckResult content={binContent}/>}
      {!bin && <BinLocationScanner ref={binRef} onScan={onScan} onClear={onBinClear}/>}
    </div>
  </ContentTheme>
}

