import React from "react";
import ContentTheme from "../../components/ContentTheme";
import GoodsReceiptAllReportTable from "./components/GoodsReceiptAllTable";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert"; // Added AlertTitle
import GoodsReceiptAllDialog from "./components/GoodsReceiptAllDetail";
import {useGoodsReceiptAllData} from "@/pages/GoodsReceipt/Data/goods-receipt-all-data";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import {useGoodsReceiptSupervisorData} from "@/pages/GoodsReceipt/Data/goods-receipt-supervisor-data";
import {useNavigate} from "react-router-dom";

export default function GoodsReceiptReportAll() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {
    data,
    title,
    id,
    detailRef,
    handleExportExcel,
    openDetails,
    onDetailUpdate,
  } = useGoodsReceiptAllData();

  return (
    <ContentTheme title={title} exportExcel={true} onExportExcel={handleExportExcel}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={() => navigate('/goodsReceiptSupervisor')}>{t('supervisor')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {data && <>
          <GoodsReceiptAllReportTable onClick={openDetails} data={data}/>
        {data.length === 0 && (
          <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
            {/* <AlertTitle>{t("warning")}</AlertTitle> */}
            <AlertDescription>{t("noExitData")}</AlertDescription>
          </Alert>
        )}
        {id && <GoodsReceiptAllDialog ref={detailRef} id={id} onUpdate={onDetailUpdate}/>}
      </>}
    </ContentTheme>
  );
}
