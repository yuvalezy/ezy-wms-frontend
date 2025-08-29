import React, {useEffect} from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import BinLocationScanner from "../../components/BinLocationScanner";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle} from 'lucide-react';
import {useBinCheckData} from "@/features/items/hooks/useBinCheckData";
import {BinCheckResult} from "@/features/items/components/BinCheckResult";
import {BinCheckFormSkeleton} from "@/features/items/components/BinCheckFormSkeleton";
import {BinCheckResultSkeleton} from "@/features/items/components/BinCheckResultSkeleton";
import {useNavigate, useParams} from "react-router";

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
    executeBinCheck,
    isCheckingBin
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
      <div className="px-3 pt-3 md:px-0 md:pt-0">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600"/>
        <AlertDescription>
          You're not connected to a bin managed warehouse.
        </AlertDescription>
      </Alert>
    </div>
    </ContentTheme>
  )

  return <ContentTheme title={t("binCheck")}
                       titleOnClick={binContent != null ? handleClearAndNavigate : undefined}
                       titleBreadcrumbs={binContent ? [{label: bin!.code}] : undefined}
                       onExportExcel={binContent != null ? handleExportExcel : undefined}
  >
    <div className="space-y-4">
      {/* Show skeleton when checking bin content */}
      {isCheckingBin && !binContent && <BinCheckResultSkeleton />}
      
      {/* Show bin content when available */}
      {binContent && !isCheckingBin && <BinCheckResult content={binContent}/>}
      
      {/* Show form skeleton when scanning bin */}
      {!bin && isCheckingBin && <BinCheckFormSkeleton />}
      
      {/* Show scanner when no bin is selected and not loading */}
      {!bin && !isCheckingBin && <BinLocationScanner ref={binRef} onScan={handleScanAndNavigate} onClear={handleClearAndNavigate}/>}
    </div>
  </ContentTheme>
}

