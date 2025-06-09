import React, {useEffect, useRef} from "react";
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
import {CountingContent, ReasonType} from "@/assets";
import Processes from "../../components/Processes";
import ContentTheme from "@/components/ContentTheme";
import {AlertCircle} from "lucide-react";
import {useCountingProcessData} from "@/pages/Counting/data/counting-process-data";
import {Link, useNavigate} from "react-router-dom";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";
import {useItemDetailsPopup} from "@/hooks/useItemDetailsPopup";
import {TransferContent} from "@/pages/transfer/data/transfer-document";

export default function CountingProcess() {
  const {t} = useTranslation();
  const {
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
    processAlertRef,
    info
  } = useCountingProcessData();
  const stockInfo = useStockInfo();
  const {openItemDetails} = useItemDetailsPopup();

  const navigate = useNavigate();

  const titleBreadcrumbs = [{label: `${info?.number}`, onClick: binLocation ? () => onBinClear() : undefined}];
  if (binLocation) {
    titleBreadcrumbs.push({label: binLocation.code, onClick: undefined});
  }

  const showDetails = (row: CountingContent) => {
    openItemDetails({
      itemCode: row.itemCode,
      itemName: row.itemName,
      numInBuy: row.numInBuy,
      buyUnitMsr: row.buyUnitMsr || "",
      purPackUn: row.purPackUn,
      purPackMsr: row.purPackMsr || ""
    });
  }

  useEffect(() => {
   console.log("currentAlert", currentAlert);
  }, [currentAlert]);

  return (
    <ContentTheme title={t("counting")}
                  titleOnClick={() => navigate('/counting')}
                  titleBreadcrumbs={titleBreadcrumbs}
                  footer={binLocation && <BarCodeScanner ref={barcodeRef} enabled unit onAddItem={handleAddItem}/>}
    >
      {!binLocation && user?.binLocations &&
          <BinLocationScanner ref={binLocationRef} onChanged={onBinChanged} onClear={onBinClear}/>}
      <div className="contentStyle">
        {currentAlert &&
            <div ref={processAlertRef}><ProcessAlert alert={currentAlert}
                                                     onAction={(type) => processesRef?.current?.open(type)}/></div>}
        {rows != null && rows.length > 0 &&
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
                        <TableCell><Link
                          className="text-blue-600 hover:underline"
                          onClick={() => showDetails(row)} to={""}>{row.itemCode}</Link></TableCell>
                        <TableCell className="hidden sm:table-cell">{row.itemName}</TableCell>
                        <TableCell>{stockInfo({
                          quantity: row.countedQuantity,
                          numInBuy: row.numInBuy,
                          buyUnitMsr: row.buyUnitMsr || "",
                          purPackUn: row.purPackUn,
                          purPackMsr: row.purPackMsr || "",
                        })}</TableCell>
                      </TableRow>
                      <TableRow className="sm:hidden">
                        <TableCell className="bg-gray-100 border-b-1"
                                   colSpan={2}>{t('description')}: {row.itemName}</TableCell>
                      </TableRow>
                    </>
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
      </div>
      {currentAlert && id && <Processes ref={processesRef} id={id} alert={currentAlert} reasonType={ReasonType.Counting}
                                        onCancel={handleCancel}
                                        onQuantityChanged={handleQuantityChanged} 
                                        onUpdateLine={async (params) => {
                                          const result = await updateLine(params);
                                          return { returnValue: result };
                                        }}/>}
    </ContentTheme>
  );
}
