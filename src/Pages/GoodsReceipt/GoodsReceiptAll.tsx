import React from "react";
import ContentTheme from "../../components/ContentTheme";
import GoodsReceiptAllReportTable from "@/features/goods-receipt/components/GoodsReceiptAllTable";
import GoodsReceiptAllSkeleton from "@/features/goods-receipt/components/GoodsReceiptAllSkeleton";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert"; // Added AlertTitle
import {Loader2} from "lucide-react";
import GoodsReceiptAllDialog from "@/features/goods-receipt/components/GoodsReceiptAllDetail";
import {useGoodsReceiptAllData} from "@/features/goods-receipt/hooks/useGoodsReceiptAllData";
import {useNavigate} from "react-router-dom";
import {ProcessType, Status} from "@/features/shared/data";
import {useAuth} from "@/components";

interface GoodsReceiptAllProps {
  processType?: ProcessType
}

export default function GoodsReceiptReportAll({processType = ProcessType.Regular}: GoodsReceiptAllProps) {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {
    data,
    detailRef,
    handleExportExcel,
    openDetails,
    onDetailUpdate,
    info,
    isLoadingReportData,
    isRefreshingDetail,
    isLoadingDetail
  } = useGoodsReceiptAllData(processType);

  const getTitle = () => {
    switch (processType) {
      case ProcessType.Confirmation:
        return t("goodsReceiptConfirmationSupervisor");
      case ProcessType.TransferConfirmation:
        return t("transferConfirmationSupervisor");
      default:
        return t("goodsReceiptSupervisor");
    }
  };

  const getTitleLink = () => {
    switch (processType) {
      case ProcessType.Confirmation:
        return '/goodsReceiptConfirmationSupervisor';
      case ProcessType.TransferConfirmation:
        return '/transferConfirmationSupervisor';
      default:
        return '/goodsReceiptSupervisor';
    }
  };

  const getSubTitle = () => {
    switch (processType) {
      case ProcessType.Confirmation:
        return t("confirmationReport");
      case ProcessType.TransferConfirmation:
        return t("transferConfirmationReport");
      default:
        return t("goodsReceiptReport");
    }
  };

  const title = getTitle();
  const titleLink = getTitleLink();
  const subTitle = getSubTitle();

  // Get user settings for skeleton configuration
  const showTarget = user?.settings.goodsReceiptTargetDocuments;
  const allowModify = data ? (data.status === Status.Open || data.status === Status.InProgress) : true;

  return (
    <ContentTheme title={title}
                  titleOnClick={() => navigate(titleLink)}
                  onExportExcel={handleExportExcel}
                  titleBreadcrumbs={[
                    {label: `${info?.number?.toString() || t('loading')}`},
                    {label: subTitle}
                  ]}>
      {isLoadingDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('loadingValues')}</p>
          </div>
        </div>
      )}
      {isLoadingReportData ? (
        <GoodsReceiptAllSkeleton 
          showTarget={showTarget} 
          allowModify={allowModify}
        />
      ) : data ? (
        <>
          {isRefreshingDetail && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="text-sm text-gray-600">{t("updating")}...</div>
            </div>
          )}
          <GoodsReceiptAllReportTable onClick={openDetails} data={data.lines} status={data.status}/>
          {data.lines.length === 0 && (
            <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
              <AlertDescription>{t("noExitData")}</AlertDescription>
            </Alert>
          )}
          {info && <GoodsReceiptAllDialog ref={detailRef} id={info.id} processType={processType} onUpdate={onDetailUpdate}/>}
        </>
      ) : null}
    </ContentTheme>
  );
}
