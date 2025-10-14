import ContentTheme from "@/components/ContentTheme";
import {useNavigate} from "react-router";
import {Button} from "@/components";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Alert, AlertDescription} from "@/components/ui/alert";
import BarCodeScanner from "@/components/BarCodeScanner";
import BinLocationScanner from "@/components/BinLocationScanner";
import ProcessAlert from "@/components/ProcessAlert";
import {ReasonType} from "@/features/shared/data";
import Processes from "@/components/Processes";
import {AlertCircle, Loader2} from "lucide-react";
import {useTransferProcessSourceData} from "@/features/transfer/hooks/useTransferProcessSourceData";
import {useStockInfo} from "@/utils/stock-info";
import React from "react";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {transferService} from "@/features/transfer/data/transefer-service";
import {ObjectType} from "@/features/packages/types";

export default function TransferProcessSource() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const stockInfo = useStockInfo();

  const {
    id,
    binLocation,
    barcodeRef,
    rows,
    currentAlert,
    isProcessingItem,
    processesRef,
    processAlertRef,
    onBinChanged,
    onBinClear,
    loadRows,
    handleAddItem,
    handleAddPackage,
    handleQuantityChanged,
    handleCancel,
    scanCode,
    user,
    info
  } = useTransferProcessSourceData();
  if (!id)
    return null;

  // Check if this is a cross-warehouse transfer
  const sourceWhs = info?.sourceWhsCode || info?.whsCode;
  const isCrossWarehouseTransfer = info?.targetWhsCode && info?.targetWhsCode !== sourceWhs;

  const titleBreadcrumbs = [
    {label: info?.number?.toString() ?? '', onClick: () => navigate(`/transfer/${scanCode}`)},
    {label: t("selectTransferSource"), onClick: binLocation ? onBinClear : undefined}
  ];
  if (binLocation) {
    titleBreadcrumbs.push({label: binLocation.code, onClick: undefined});
  }

  return (
    <ContentTheme title={t("transfer")} titleOnClick={() => navigate(`/transfer`)}
                  titleBreadcrumbs={titleBreadcrumbs}
                  footer={binLocation &&
                      <BarCodeScanner
                          unit
                          ref={barcodeRef}
                          onAddItem={handleAddItem}
                          enabled
                          enablePackage={user!.settings!.enablePackages}
                          enablePackageCreate={false}
                          isEphemeralPackage={false}
                          objectType={ObjectType.Transfer}
                          objectId={info?.id}
                          objectNumber={info?.number}
                          binEntry={binLocation?.entry}
                          onPackageChanged={handleAddPackage}
                      />}
    >
      {isProcessingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('processingItem')}</p>
          </div>
        </div>
      )}
      {user?.binLocations && !binLocation &&
          <BinLocationScanner showLabel={false} onChanged={onBinChanged} onClear={onBinClear}/>}
      <div className="contentStyle">
        {currentAlert &&
            <div ref={processAlertRef}><ProcessAlert alert={currentAlert}
                                                     onAction={(type) => processesRef?.current?.open(type)}/></div>}
        {rows != null && rows.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Only show target bins button for same-warehouse transfers */}
            {!isCrossWarehouseTransfer && (
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
                        {stockInfo({
                          quantity: row.quantity,
                          numInBuy: row.numInBuy,
                          buyUnitMsr: row.buyUnitMsr,
                          purPackUn: row.purPackUn,
                          purPackMsr: row.purPackMsr,
                        })}
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
        {rows != null && rows.length === 0 &&
            <Alert variant="information">
                <AlertCircle className="h-4 w-4"/>
                <AlertDescription>{t("nodata")}</AlertDescription>
            </Alert>
        }
      </div>
      {currentAlert && id && <Processes
          ref={processesRef}
          id={id}
          alert={currentAlert}
          reasonType={ReasonType.Transfer}
          onCancel={handleCancel}
          onQuantityChanged={handleQuantityChanged}
          onUpdateLine={transferService.updateLine}
          onUpdateComplete={loadRows}
      />}
    </ContentTheme>
  );
}
