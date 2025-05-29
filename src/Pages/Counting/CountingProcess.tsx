import React from "react";
import {useTranslation} from "react-i18next";
import {Label} from "@/components/ui/label";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Alert, AlertDescription} from "@/components/ui/alert";
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Label>{t('code')}</Label></TableHead>
                        <TableHead><Label>{t('units')}</Label></TableHead>
                        <TableHead><Label>{t('dozens')}</Label></TableHead>
                        <TableHead><Label>{t('boxes')}</Label></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <React.Fragment key={row.code}>
                      <TableRow>
                        <TableCell><Label>{row.code}</Label></TableCell>
                        <TableCell><Label>{row.unit}</Label></TableCell>
                        <TableCell><Label>{row.dozen}</Label></TableCell>
                        <TableCell><Label>{row.pack}</Label></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4}><Label>{t('description')}: {row.name}</Label></TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
            </Table>
        }
        {rows != null && rows.length === 0 &&
            <Alert variant="default">
                <AlertCircle className="h-4 w-4"/>
                <AlertDescription>
                  {t("binCountItems")}
                </AlertDescription>
            </Alert>
        }
      </ScrollableContentBox>
      {enable && <BarCodeScanner ref={barcodeRef} enabled unit onAddItem={handleAddItem}/>}
      {currentAlert && id && <Processes ref={processesRef} id={id} alert={currentAlert} reasonType={ReasonType.Counting}
                                        onCancel={handleCancel}
                                        onQuantityChanged={handleQuantityChanged} onUpdateLine={updateLine}/>}
    </ContentTheme>
  );
}
