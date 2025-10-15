import ContentTheme from "@/components/ContentTheme";
import {useNavigate} from "react-router";
import React from "react";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Progress} from "@/components/ui/progress";
import BarCodeScanner from "@/components/BarCodeScanner";
import BinLocationScanner from "@/components/BinLocationScanner";
import ProcessAlert from "@/components/ProcessAlert";
import {ReasonType} from "@/features/shared/data";
import Processes from "@/components/Processes";
import {Card, CardContent, InfoBoxValue} from "@/components";
import InfoBox from "@/components/InfoBox";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {transferService} from "@/features/transfer/data/transefer-service";
import {ObjectType} from "@/features/packages/types";
import {useTransferProcess} from "@/features/transfer/context/TransferProcessContext";
import {SourceTarget} from "@/features/transfer/data/transfer";
import {ProcessingOverlay} from "@/features/transfer/components/processing-overlay";
import {EmptyRowsAlert} from "@/features/transfer/components/empty-rows-alert";
import {TransferRowStockInfo} from "@/features/transfer/components/transfer-row-stock-info";
import {useTransferBreadcrumbs} from "@/features/transfer/hooks/useTransferBreadcrumbs";

export default function TransferProcessTargetBins() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {
    id,
    scanCode,
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
    user,
    info
  } = useTransferProcess();

  const titleBreadcrumbs = useTransferBreadcrumbs({
    info,
    scanCode,
    binLocation,
    user,
    onBinClear,
    pageType: 'targetBins'
  });

  if (!id) return null;

  return (
    <ContentTheme title={t("transfer")} titleOnClick={() => navigate(`/transfer`)}
                  titleBreadcrumbs={titleBreadcrumbs}
                  footer={binLocation &&
                      <BarCodeScanner
                          unit
                          ref={barcodeRef}
                          onAddItem={(value) => handleAddItem(SourceTarget.Target, value)}
                          enabled
                          enablePackage={user!.settings!.enablePackages}
                          enablePackageCreate={false}
                          isEphemeralPackage={false}
                          objectType={ObjectType.Transfer}
                          objectId={info?.id}
                          objectNumber={info?.number}
                          onPackageChanged={(value) => handleAddPackage(SourceTarget.Target, value)}
                      />}
    >
      {isProcessingItem && <ProcessingOverlay />}
      {user?.binLocations && !binLocation && <BinLocationScanner onChanged={(bin) => onBinChanged(bin, SourceTarget.Target)} onClear={onBinClear}/>}
      <div className="contentStyle">
        {currentAlert &&
            <div ref={processAlertRef}><ProcessAlert alert={currentAlert}
                                                     onAction={(type) => processesRef?.current?.open(type)}/></div>}
        {rows != null && rows.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Mobile view - Cards */}
            <div className="block sm:hidden">
              {rows.map((row) => {
                return <Card key={row.itemCode}>
                  <CardContent className="flex flex-col gap-2">
                    <InfoBox>
                      <InfoBoxValue label={t('code')} itemDetailsLink={row} value={row.itemCode}/>
                      <InfoBoxValue label={t('description')} value={row.itemName}/>
                      <InfoBoxValue label={t('openQuantity')} value={
                        <TransferRowStockInfo row={row} quantityField="openQuantity" />
                      }/>
                      <InfoBoxValue label={t('binQuantity')} value={
                        <TransferRowStockInfo row={row} quantityField="binQuantity" />
                      }/>
                    </InfoBox>
                    <Progress value={row.progress ?? 0} className="w-full h-2"/>
                    <p className="text-xs text-muted-foreground text-center">{`${row.progress ?? 0}%`}</p>
                  </CardContent>
                </Card>
              })}
            </div>
            
            {/* Desktop view - Table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('code')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('openQuantity')}</TableHead>
                    <TableHead>{t('binQuantity')}</TableHead>
                    <TableHead>{t('progress')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    return (
                      <TableRow key={row.itemCode}>
                        <TableCell>
                          <ItemDetailsLink data={row} />
                        </TableCell>
                        <TableCell>{row.itemName}</TableCell>
                        <TableCell>
                          <TransferRowStockInfo row={row} quantityField="openQuantity" />
                        </TableCell>
                        <TableCell>
                          <TransferRowStockInfo row={row} quantityField="binQuantity" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={row.progress ?? 0} className="w-20" />
                            <span className="text-xs">{row.progress ?? 0}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
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
          onUpdateComplete={() => loadRows(SourceTarget.Target)}
      />}
    </ContentTheme>
  );
}
