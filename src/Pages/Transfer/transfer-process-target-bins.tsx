import ContentTheme from "@/components/ContentTheme";
import {Link, useNavigate} from "react-router-dom";
import React from "react";
import {useTranslation} from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Progress} from "@/components/ui/progress";
import BarCodeScanner from "@/components/BarCodeScanner";
import BinLocationScanner from "@/components/BinLocationScanner";
import ProcessAlert from "@/components/ProcessAlert";
import {ReasonType, UnitType} from "@/assets";
import Processes from "@/components/Processes";
import {updateLine} from "@/pages/transfer/data/transfer-process";
import {useTransferProcessTargetBinsData} from "@/pages/transfer/data/transfer-process-target-bins-data";
import {Card, CardContent, FullInfoBox, InfoBoxValue, MetricRow, SecondaryInfoBox} from "@/components";
import {formatNumber} from "@/lib/utils";
import {AlertCircle} from "lucide-react";
import {useStockInfo} from "@/utils/stock-info";
import {TransferContent} from "@/pages/transfer/data/transfer-document";
import {useItemDetailsPopup} from "@/hooks/useItemDetailsPopup";
import InfoBox from "@/components/InfoBox";

export default function TransferProcessTargetBins() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const stockInfo = useStockInfo();
  const {openItemDetails} = useItemDetailsPopup();
  const {
    id,
    binLocation,
    enable,
    barcodeRef,
    rows,
    currentAlert,
    processesRef,
    processAlertRef,
    onBinChanged,
    onBinClear,
    loadRows,
    handleAddItem,
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
  const showDetails = (row: TransferContent) => {
    openItemDetails({
      itemCode: row.code,
      itemName: row.name,
      numInBuy: row.numInBuy,
      buyUnitMsr: row.buyUnitMsr,
      purPackUn: row.purPackUn,
      purPackMsr: row.purPackMsr
    });
  }

  return (
    <ContentTheme title={t("transfer")} titleOnClick={() => navigate(`/transfer`)}
                  titleBreadcrumbs={titleBreadcrumbs}
                  footer={binLocation &&
                      <BarCodeScanner unit ref={barcodeRef} onAddItem={handleAddItem} enabled/>}
    >
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
                return <Card key={row.code}>
                  <CardContent className="flex flex-col gap-2">
                    <InfoBox>
                      <InfoBoxValue label={t('code')} onClick={() => showDetails(row)} value={row.code}/>
                      <InfoBoxValue label={t('description')} value={row.name}/>
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
                      <TableRow key={row.code}>
                        <TableCell><Link
                          className="text-blue-600 hover:underline"
                          onClick={() => showDetails(row)} to={""}>{row.code}</Link>
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
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
          onUpdateLine={updateLine}
          onUpdateComplete={loadRows}
      />}
    </ContentTheme>
  );
}
