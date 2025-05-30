import ContentTheme from "@/components/ContentTheme";
import {useNavigate} from "react-router-dom";
import {Button, Card, CardContent, FullInfoBox, InfoBoxValue, SecondaryInfoBox} from "@/components";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import BarCodeScanner from "@/components/BarCodeScanner";
import BinLocationScanner from "@/components/BinLocationScanner";
import ProcessAlert from "@/components/ProcessAlert";
import {ReasonType, UnitType} from "@/assets";
import Processes from "@/components/Processes";
import {updateLine} from "@/pages/Transfer/data/transfer-process";
import {AlertCircle} from "lucide-react";
import {useTransferProcessSourceData} from "@/pages/Transfer/data/transfer-process-source-data";

export default function TransferProcessSource() {
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
  } = useTransferProcessSourceData();
  if (!id)
    return null;

  const titleBreadcrumbs = [
    {label: scanCode ?? '', onClick: () => navigate(`/transfer/${scanCode}`)},
    {label: t("selectTransferSource"), onClick: binLocation ? onBinClear : undefined}
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
      {user?.binLocations && !binLocation &&
          <BinLocationScanner showLabel={false} onChanged={onBinChanged} onClear={onBinClear}/>}
      <div className="contentStyle">
        {currentAlert &&
            <div ref={processAlertRef}><ProcessAlert alert={currentAlert}
                                                     onAction={(type) => processesRef?.current?.open(type)}/></div>}
        {rows != null && rows.length > 0 && (
          <div className="flex flex-col gap-4">
            <Button type="button" variant="default" onClick={() => navigate(`/transfer/${id}/targetBins`)}>
              {t("selectTransferTargetBins") || "Select Target Bins"}
            </Button>
            {rows.map((row) => {
              return <Card>
                <CardContent className="flex flex-col gap-2">
                  <SecondaryInfoBox>
                    <InfoBoxValue label={t('code')} value={row.code} />
                    <InfoBoxValue label={t('quantity')} value={row.quantity} />
                    <InfoBoxValue label={t('unit')} value={row.unit === UnitType.Unit ? t('unit') :
                    row.unit === UnitType.Dozen ? row.buyUnitMsr ?? t('buyUnit') :
                    row.purPackMsr ?? t('packUnit')} />
                    {row.unit !== UnitType.Unit && <InfoBoxValue label={t('qtyInUn')} value={row.numInBuy.toString()}/>}
                    {row.unit === UnitType.Pack && <InfoBoxValue label={t('qtyInPack')} value={row.purPackUn.toString()}/>}
                  </SecondaryInfoBox>
                  <FullInfoBox>
                    <InfoBoxValue label={t('description')} value={row.name} />
                  </FullInfoBox>
                </CardContent>
              </Card>
            })}
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
          onUpdateLine={updateLine}
          onUpdateComplete={loadRows}
      />}
    </ContentTheme>
  );
}
