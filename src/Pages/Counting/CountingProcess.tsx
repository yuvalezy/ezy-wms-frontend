import React from "react";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert";
import BarCodeScanner from "../../components/BarCodeScanner";
import BinLocationScanner from "../../components/BinLocationScanner";
import ProcessAlert from "../../components/ProcessAlert";
import {ReasonType} from "@/assets";
import Processes from "../../components/Processes";
import ContentTheme from "@/components/ContentTheme";
import {AlertCircle} from "lucide-react";
import {useCountingProcessData} from "@/features/counting/hooks/useCountingProcessData";
import {useNavigate} from "react-router-dom";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {countingService} from "@/features/counting/data/counting-service";
import {ObjectType} from "@/pages/packages/types";

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
    info,
    currentPackage,
    setCurrentPackage,
  } = useCountingProcessData();
  const stockInfo = useStockInfo();

  const navigate = useNavigate();

  const titleBreadcrumbs = [{label: `${info?.number}`, onClick: binLocation ? () => onBinClear() : undefined}];
  if (binLocation) {
    titleBreadcrumbs.push({label: binLocation.code, onClick: undefined});
  }

  return (
    <ContentTheme title={t("counting")}
                  titleOnClick={() => navigate('/counting')}
                  titleBreadcrumbs={titleBreadcrumbs}
                  footer={binLocation && (
                    <BarCodeScanner
                      ref={barcodeRef}
                      enabled
                      unit
                      enablePackage={user!.settings!.enablePackages}
                      currentPackage={currentPackage}
                      objectType={ObjectType.InventoryCounting}
                      objectId={info?.id}
                      objectNumber={info?.number}
                      binEntry={binLocation?.entry}
                      onAddItem={handleAddItem}
                      onPackageChanged={setCurrentPackage}
                    />
                  )}
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
                        <TableCell>
                          <ItemDetailsLink data={row}/>
                        </TableCell>
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
                                          const result = await countingService.updateLine(params);
                                          return {returnValue: result};
                                        }}/>}
    </ContentTheme>
  );
}
