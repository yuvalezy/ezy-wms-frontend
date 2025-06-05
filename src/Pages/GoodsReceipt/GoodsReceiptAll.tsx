import React from "react";
import ContentTheme from "../../components/ContentTheme";
import GoodsReceiptAllReportTable from "@/pages/GoodsReceipt/components/GoodsReceiptAllTable";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert"; // Added AlertTitle
import GoodsReceiptAllDialog from "@/pages/GoodsReceipt/components/GoodsReceiptAllDetail";
import {useGoodsReceiptAllData} from "@/pages/GoodsReceipt/data/goods-receipt-all-data";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import {useNavigate} from "react-router-dom";

interface GoodsReceiptAllProps {
  confirm?: boolean
}

export default function GoodsReceiptReportAll({confirm = false}: GoodsReceiptAllProps) {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {
    data,
    detailRef,
    handleExportExcel,
    openDetails,
    onDetailUpdate,
    info
  } = useGoodsReceiptAllData(confirm);

  const title = `${!confirm ? t("goodsReceiptSupervisor") : t("goodsReceiptConfirmationSupervisor")}`;
  const titleLink = `/goodsReceipt${confirm ? 'Confirmation' : ''}Supervisor`;
  const subTitle = !confirm ? t("goodsReceiptReport") : t("confirmationReport");

  return (
    <ContentTheme title={title}
                  titleOnClick={() => navigate(titleLink)}
                  onExportExcel={handleExportExcel}
                  titleBreadcrumbs={[
                    {label: `${info?.number}`},
                    {label: subTitle}
                  ]}>
      {data && <>
          <GoodsReceiptAllReportTable onClick={openDetails} data={data}/>
        {data.length === 0 && (
          <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
            <AlertDescription>{t("noExitData")}</AlertDescription>
          </Alert>
        )}
        {info && <GoodsReceiptAllDialog ref={detailRef} id={info.id} confirm={confirm} onUpdate={onDetailUpdate}/>}
      </>}
    </ContentTheme>
  );
}
