import React from "react";
import ContentTheme from "../../components/ContentTheme";
import GoodsReceiptAllReportTable from "@/features/goods-receipt/components/GoodsReceiptAllTable";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert"; // Added AlertTitle
import GoodsReceiptAllDialog from "@/features/goods-receipt/components/GoodsReceiptAllDetail";
import {useGoodsReceiptAllData} from "@/features/goods-receipt/hooks/useGoodsReceiptAllData";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import {useNavigate} from "react-router-dom";
import {ProcessType} from "@/features/shared/data";

interface GoodsReceiptAllProps {
  processType?: ProcessType
}

export default function GoodsReceiptReportAll({processType = ProcessType.Regular}: GoodsReceiptAllProps) {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {
    data,
    detailRef,
    handleExportExcel,
    openDetails,
    onDetailUpdate,
    info
  } = useGoodsReceiptAllData(processType === ProcessType.Confirmation || processType === ProcessType.TransferConfirmation);

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

  return (
    <ContentTheme title={title}
                  titleOnClick={() => navigate(titleLink)}
                  onExportExcel={handleExportExcel}
                  titleBreadcrumbs={[
                    {label: `${info?.number}`},
                    {label: subTitle}
                  ]}>
      {data && <>
          <GoodsReceiptAllReportTable onClick={openDetails} data={data.lines} status={data.status}/>
        {data.lines.length === 0 && (
          <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
            <AlertDescription>{t("noExitData")}</AlertDescription>
          </Alert>
        )}
        {info && <GoodsReceiptAllDialog ref={detailRef} id={info.id} confirm={confirm} onUpdate={onDetailUpdate}/>}
      </>}
    </ContentTheme>
  );
}
