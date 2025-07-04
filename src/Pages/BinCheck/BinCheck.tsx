import React, { useEffect } from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import BinLocationScanner from "../../components/BinLocationScanner";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle} from 'lucide-react';
import {useBinCheckData} from "@/pages/BinCheck/bin-check-data";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import {BinCheckResult} from "@/pages/BinCheck/BinCheckResult";
import {useParams, useNavigate} from "react-router-dom";

export function BinCheck() {
  const {t} = useTranslation();
  const { binEntry, binCode } = useParams();
  const navigate = useNavigate();
  
  const {
    bin,
    binRef,
    user,
    binContent,
    onScan,
    onBinClear,
    handleExportExcel,
    executeBinCheck
  } = useBinCheckData();

  useEffect(() => {
    if (binEntry && binCode && !binContent) {
      executeBinCheck(binEntry, binCode);
    }
  }, [binEntry, binCode, executeBinCheck, binContent]);

  const handleClearAndNavigate = () => {
    onBinClear();
    navigate('/binCheck');
  };

  const handleScanAndNavigate = (binLocation: any) => {
    navigate(`/binCheck/${binLocation.entry}/${binLocation.code}`);
  };

  if (!user?.binLocations) return (
    <ContentTheme title={t("binCheck")}>
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600"/>
        <AlertDescription>
          You're not connected to a bin managed warehouse.
        </AlertDescription>
      </Alert>
    </ContentTheme>
  )

  return <ContentTheme title={t("binCheck")}
                       titleOnClick={binContent != null ? handleClearAndNavigate : undefined}
                       titleBreadcrumbs={binContent ? [{label: bin!.code}] : undefined}
                       onExportExcel={binContent != null ? handleExportExcel : undefined}
  >
    <div className="space-y-4">
      {binContent && <BinCheckResult content={binContent}/>}
      {!bin && <BinLocationScanner ref={binRef} onScan={handleScanAndNavigate} onClear={handleClearAndNavigate}/>}
    </div>
  </ContentTheme>
}

