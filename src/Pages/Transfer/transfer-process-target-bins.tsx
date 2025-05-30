import ContentTheme from "@/components/ContentTheme";
import {useNavigate} from "react-router-dom";
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
import {updateLine} from "@/pages/Transfer/data/transfer-process";
import {useTransferProcessTargetBinsData} from "@/pages/Transfer/data/transfer-process-target-bins-data";
import {Card, CardContent, FullInfoBox, InfoBoxValue, MetricRow, SecondaryInfoBox} from "@/components";
import {formatNumber} from "@/lib/utils";
import {AlertCircle} from "lucide-react";

export default function TransferProcessTargetBins() {
  const {t} = useTranslation();
  const navigate = useNavigate();
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
    user
  } = useTransferProcessTargetBinsData();

  if (!id)
    return null;

  const titleBreadcrumbs = [
    {label: scanCode ?? '', onClick: () => navigate(`/transfer/${scanCode}`)},
    {label: t("selectTransferTargetBins"), onClick: binLocation ? onBinClear : undefined}
  ];
  if (binLocation) {
    titleBreadcrumbs.push({label: binLocation.code, onClick: undefined});
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
            {rows.map((row) => {
              let openQuantity = row.openQuantity ?? 0;
              let binQuantity = row.binQuantity ?? 0;
              return <Card>
                <CardContent className="flex flex-col gap-2">
                  <SecondaryInfoBox>
                    <InfoBoxValue label={t('code')} value={row.code}/>
                    <InfoBoxValue label={t('qtyInUn')} value={row.numInBuy.toString()}/>
                    <InfoBoxValue label={t('qtyInPack')} value={row.purPackUn.toString()}/>
                  </SecondaryInfoBox>
                  <div className="flex justify-between items-center border-b-2 border-primary font-bold">
                    <div className="w-[30%]">
                      <span>{t('unit')}</span>
                    </div>
                    <div className="flex-1 flex justify-around text-center">
                      <div className="flex-1 text-xs">
                        <span>{t('units')}</span>
                      </div>
                      <div className="flex-1 text-xs">
                        <span>{t('dozens')}</span>
                      </div>
                      <div className="flex-1 text-xs">
                        <span>{t('boxes')}</span>
                      </div>
                    </div>
                  </div>
                  <MetricRow
                    label={t('openQuantity')}
                    values={{
                      units: formatNumber(openQuantity, 0),
                      buyUnits: formatNumber(openQuantity / row.numInBuy, 2),
                      packUnits: formatNumber(openQuantity / row.numInBuy / row.purPackUn, 2)
                    }}
                  />
                  <MetricRow
                    label={t('binQuantity')}
                    values={{
                      units: formatNumber(binQuantity, 0),
                      buyUnits: formatNumber(binQuantity / row.numInBuy, 2),
                      packUnits: formatNumber(binQuantity / row.numInBuy / row.purPackUn, 2)
                    }}
                  />
                  <Progress value={row.progress ?? 0} className="w-full h-2"/>
                  <p className="text-xs text-muted-foreground text-center">{`${row.progress ?? 0}%`}</p>
                </CardContent>
              </Card>
            })}
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
