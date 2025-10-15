import ContentTheme from "@/components/ContentTheme";
import {useNavigate} from "react-router";
import {Button} from "@/components";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Alert, AlertDescription} from "@/components/ui/alert";
import BinLocationScanner from "@/components/BinLocationScanner";
import ProcessAlert from "@/components/ProcessAlert";
import {ReasonType} from "@/features/shared/data";
import Processes from "@/components/Processes";
import React, {useEffect} from "react";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {transferService} from "@/features/transfer/data/transefer-service";
import {useTransferProcess} from "@/features/transfer/context/TransferProcessContext";
import {SourceTarget} from "@/features/transfer/data/transfer";
import TransferProcessSourceItem from "./transfer-process-source-item";
import {ProcessingOverlay} from "@/features/transfer/components/processing-overlay";
import {EmptyRowsAlert} from "@/features/transfer/components/empty-rows-alert";
import {TransferRowStockInfo} from "@/features/transfer/components/transfer-row-stock-info";
import {isCrossWarehouseTransfer} from "@/features/transfer/utils/transfer-utils";
import {useTransferBreadcrumbs} from "@/features/transfer/hooks/useTransferBreadcrumbs";

export default function TransferProcessSource() {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const {
    id,
    scanCode,
    binLocation,
    rows,
    currentAlert,
    isProcessingItem,
    processesRef,
    processAlertRef,
    onBinChanged,
    onBinClear,
    loadRows,
    handleQuantityChanged,
    handleCancel,
    user,
    info
  } = useTransferProcess();

  // Load rows on mount for non-bin-managed warehouses
  useEffect(() => {
    if (id && !user?.binLocations) {
      loadRows(SourceTarget.Source);
    }
  }, [id, user?.binLocations, loadRows]);

  const crossWarehouse = isCrossWarehouseTransfer(info);
  const titleBreadcrumbs = useTransferBreadcrumbs({
    info,
    scanCode,
    binLocation,
    user,
    onBinClear,
    pageType: 'source'
  });

  if (!id) return null;

  return (
    <ContentTheme title={t("transfer")} titleOnClick={() => navigate(`/transfer`)}
                  titleBreadcrumbs={titleBreadcrumbs}
                  footer={(!user?.binLocations || binLocation) && <TransferProcessSourceItem />}
    >
      {isProcessingItem && <ProcessingOverlay />}
      {user?.binLocations && !binLocation &&
          <BinLocationScanner showLabel={false} onChanged={(bin) => onBinChanged(bin, SourceTarget.Source)} onClear={onBinClear}/>}
      <div className="contentStyle">
        {currentAlert &&
            <div ref={processAlertRef}><ProcessAlert alert={currentAlert}
                                                     onAction={(type) => processesRef?.current?.open(type)}/></div>}
        {rows != null && rows.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Only show target bins button for same-warehouse transfers */}
            {!crossWarehouse && (
              <Button type="button" variant="default" onClick={() => navigate(`/transfer/${id}/targetBins`)}>
                {t("selectTransferTargetBins") || "Select Target Bins"}
              </Button>
            )}

            {/* Desktop view - Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('code')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('description')}</TableHead>
                  <TableHead>{t('quantity')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <>
                    <TableRow key={row.itemCode}>
                      <TableCell>
                        <ItemDetailsLink data={row} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{row.itemName}</TableCell>
                      <TableCell>
                        <TransferRowStockInfo row={row} quantityField="quantity" />
                      </TableCell>
                    </TableRow>
                    <TableRow className="sm:hidden">
                      <TableCell className="bg-gray-100 border-b-1"
                                 colSpan={2}>{t('description')}: {row.itemName}</TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {rows != null && rows.length === 0 && <EmptyRowsAlert />}
      </div>
      {currentAlert && id && <Processes
          ref={processesRef}
          id={id}
          alert={currentAlert}
          reasonType={ReasonType.Transfer}
          onCancel={handleCancel}
          onQuantityChanged={handleQuantityChanged}
          onUpdateLine={transferService.updateLine}
          onUpdateComplete={() => loadRows(SourceTarget.Source)}
      />}
    </ContentTheme>
  );
}
