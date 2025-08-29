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
import {useTransferProcessTargetBinsData} from "@/features/transfer/hooks/useTransferProcessTargetBinsData";
import {Card, CardContent, InfoBoxValue} from "@/components";
import {AlertCircle, Loader2} from "lucide-react";
import {useStockInfo} from "@/utils/stock-info";
import InfoBox from "@/components/InfoBox";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {transferService} from "@/features/transfer/data/transefer-service";
import {ObjectType} from "@/features/packages/types";

export default function TransferProcessTargetBins() {
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
  } = useTransferProcessTargetBinsData();

  if (!id)
    return null;

  const titleBreadcrumbs = [
    {label: info?.number?.toString() ?? '', onClick: () => navigate(`/transfer/${scanCode}`)},
    {label: t("selectTransferTargetBins"), onClick: binLocation ? onBinClear : undefined}
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
      {user?.binLocations && !binLocation && <BinLocationScanner onChanged={onBinChanged} onClear={onBinClear}/>}
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
                      <InfoBoxValue label={t('openQuantity')} value={stockInfo({
                            quantity: row.openQuantity,
                            numInBuy: row.numInBuy,
                            buyUnitMsr: row.buyUnitMsr,
                            purPackUn: row.purPackUn,
                            purPackMsr: row.purPackMsr,
                          })}/>
                      <InfoBoxValue label={t('binQuantity')} value={stockInfo({
                            quantity: row.binQuantity??0,
                            numInBuy: row.numInBuy,
                            buyUnitMsr: row.buyUnitMsr,
                            purPackUn: row.purPackUn,
                            purPackMsr: row.purPackMsr,
                          })}/>
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
                          {stockInfo({
                            quantity: row.openQuantity,
                            numInBuy: row.numInBuy,
                            buyUnitMsr: row.buyUnitMsr,
                            purPackUn: row.purPackUn,
                            purPackMsr: row.purPackMsr,
                          })}
                        </TableCell>
                        <TableCell>
                          {stockInfo({
                            quantity: row.binQuantity??0,
                            numInBuy: row.numInBuy,
                            buyUnitMsr: row.buyUnitMsr,
                            purPackUn: row.purPackUn,
                            purPackMsr: row.purPackMsr,
                          })}
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
        {rows != null && rows.length === 0 &&
            <Alert variant="information">
                <AlertCircle className="h-4 w-4"/>
                <AlertDescription>
                  {t("nodata")}
                </AlertDescription>
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
