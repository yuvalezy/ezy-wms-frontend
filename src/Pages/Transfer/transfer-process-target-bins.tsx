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
import {ReasonType} from "@/assets";
import Processes from "@/components/Processes";
import {updateLine} from "@/pages/Transfer/data/transfer-process";
import {useTransferProcessTargetBinsData} from "@/pages/Transfer/data/transfer-process-target-bins-data";

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
                      <BarCodeScanner unit ref={barcodeRef} onAddItem={handleAddItem} enabled={enable}/>}
    >
      {user?.binLocations && !binLocation && <BinLocationScanner onChanged={onBinChanged} onClear={onBinClear}/>}
      <div className="contentStyle">
        {currentAlert &&
            <div ref={processAlertRef}><ProcessAlert alert={currentAlert}
                                                     onAction={(type) => processesRef?.current?.open(type)}/></div>}
        {rows != null && rows.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Label>{t('code')}</Label></TableHead>
                    <TableHead><Label>{t('description')}</Label></TableHead>
                    <TableHead className="text-right"><Label>{t('openQuantity')}</Label></TableHead>
                    <TableHead className="text-right"><Label>{t('binQuantity')}</Label></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <React.Fragment key={row.code}>
                      <TableRow>
                        <TableCell><Label>{row.code}</Label></TableCell>
                        <TableCell><Label>{row.name}</Label></TableCell>
                        <TableCell className="text-right"><Label>{row.openQuantity}</Label></TableCell>
                        <TableCell className="text-right"><Label>{row.binQuantity}</Label></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="p-1">
                          <Progress value={row.progress ?? 0} className="w-full h-2"/>
                          <p className="text-xs text-muted-foreground text-center">{`${row.progress ?? 0}%`}</p>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {rows != null && rows.length === 0 &&
            <div className="p-4">
                <Alert variant="default" className="bg-blue-100 border-blue-400 text-blue-700">
                  {/* <AlertTitle>Information</AlertTitle> */}
                    <AlertDescription>{t("nodata")}</AlertDescription>
                </Alert>
            </div>
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
