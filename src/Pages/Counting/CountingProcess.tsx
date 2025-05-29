import React from "react";
import {useTranslation} from "react-i18next";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {MetricRow} from "@/components/MetricRow";
import {formatNumber} from "@/lib/utils";
import BarCodeScanner from "../../components/BarCodeScanner";
import BinLocationScanner from "../../components/BinLocationScanner";
import {updateLine} from "@/pages/Counting/data/CountingProcess";
import ProcessAlert from "../../components/ProcessAlert";
import {ReasonType} from "@/assets";
import Processes from "../../components/Processes";
import {
  Breadcrumb,
  BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  ScrollableContentBox
} from "@/components";
import ContentTheme from "@/components/ContentTheme";
import {AlertCircle} from "lucide-react";
import {useCountingProcessData} from "@/pages/Counting/data/counting-process-data";

export default function CountingProcess() {
  const {t} = useTranslation();
  const {
    title,
    id,
    binLocationRef,
    enable,
    user,
    barcodeRef,
    rows,
    currentAlert,
    processesRef,
    binLocation,
    onBinChanged,
    onBinClear,
    handleQuantityChanged,
    handleCancel,
    handleAddItem,
  } = useCountingProcessData();

  return (
    <ContentTheme title={title}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {!binLocation ? <BreadcrumbPage>{t("counting")}</BreadcrumbPage> :
              <BreadcrumbLink href="#" onClick={onBinClear}>{t("counting")}</BreadcrumbLink>}
          </BreadcrumbItem>
          {binLocation && <BreadcrumbItem>
              <BreadcrumbPage>{binLocation?.code}</BreadcrumbPage>
          </BreadcrumbItem>}
        </BreadcrumbList>
      </Breadcrumb>
      {!binLocation && user?.binLocations &&
          <BinLocationScanner ref={binLocationRef} onChanged={onBinChanged} onClear={onBinClear}/>}
      <ScrollableContentBox>
        {currentAlert &&
            <ProcessAlert alert={currentAlert} onAction={(type) => processesRef?.current?.open(type)}/>}
        {rows != null && rows.length > 0 &&
            <div className="flex flex-col gap-4">
              {rows.map((row) => (
                <Card key={row.code} className="w-full shadow-lg">
                  <CardHeader>
                    <CardTitle>{`${t('code')}: ${row.code}`}</CardTitle>
                    <CardDescription>{`${t('description')}: ${row.name}`}</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                      label={t('quantity')}
                      values={{
                      units: formatNumber(row.unit ?? 0, 0),
                      buyUnits: formatNumber(row.dozen ?? 0, 0),
                      packUnits: formatNumber(row.pack ?? 0, 0)
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
        }
        {rows != null && rows.length === 0 &&
            <Alert variant="default">
                <AlertCircle className="h-4 w-4"/>
                <AlertDescription>
                  {t("binCountItems")}
                </AlertDescription>
            </Alert>
        }
      {enable && <BarCodeScanner fixed ref={barcodeRef} enabled unit onAddItem={handleAddItem}/>}
      </ScrollableContentBox>
      {currentAlert && id && <Processes ref={processesRef} id={id} alert={currentAlert} reasonType={ReasonType.Counting}
                                        onCancel={handleCancel}
                                        onQuantityChanged={handleQuantityChanged} onUpdateLine={updateLine}/>}
    </ContentTheme>
  );
}
