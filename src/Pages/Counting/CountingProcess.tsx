import React from "react";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert";
import BarCodeScanner from "../../components/BarCodeScanner";
import BinLocationScanner from "../../components/BinLocationScanner";
import ProcessAlert from "../../components/ProcessAlert";
import {ReasonType} from "@/features/shared/data";
import Processes from "../../components/Processes";
import ContentTheme from "@/components/ContentTheme";
import {AlertCircle} from "lucide-react";
import {useCountingProcessData} from "@/features/counting/hooks/useCountingProcessData";
import {useNavigate} from "react-router-dom";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {countingService} from "@/features/counting/data/counting-service";
import {ObjectType} from "@/features/packages/types";
import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent} from "@/components/ui/card";

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

  // Loading states based on data availability
  const isLoadingInfo = !info && id;
  const isLoadingRows = rows === null && binLocation;

  const titleBreadcrumbs = [{label: `${info?.number}`, onClick: binLocation ? () => onBinClear() : undefined}];
  if (binLocation) {
    titleBreadcrumbs.push({label: binLocation.code, onClick: undefined});
  }

  // Skeleton components
  const BinLocationSkeleton = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-20" />
        </div>
      </CardContent>
    </Card>
  );

  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, index) => (
          <>
            <TableRow key={`main-${index}`}>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            </TableRow>
            <TableRow key={`mobile-${index}`} className="sm:hidden">
              <TableCell className="bg-gray-100 border-b-1" colSpan={2}>
                <Skeleton className="h-4 w-48" />
              </TableCell>
            </TableRow>
          </>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <ContentTheme title={isLoadingInfo ? t("counting") : t("counting")}
                  titleOnClick={() => navigate('/counting')}
                  titleBreadcrumbs={isLoadingInfo ? [] : titleBreadcrumbs}
                  footer={(binLocation || !user?.binLocations) && !isLoadingInfo && (
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
      {isLoadingInfo ? (
        <div className="contentStyle" aria-label="Loading...">
          <div className="mb-4">
            <Skeleton className="h-8 w-48 mb-4" />
          </div>
          <BinLocationSkeleton />
        </div>
      ) : (
        <>
          {!binLocation && user?.binLocations &&
              <BinLocationScanner ref={binLocationRef} onChanged={onBinChanged} onClear={onBinClear}/>}
          <div className="contentStyle">
            {currentAlert &&
                <div ref={processAlertRef}><ProcessAlert alert={currentAlert}
                                                         onAction={(type) => processesRef?.current?.open(type)}/></div>}
            {isLoadingRows ? (
              <div aria-label="Loading...">
                <TableSkeleton />
              </div>
            ) : rows != null && rows.length > 0 ? (
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
            ) : rows != null && rows.length === 0 && (
                <Alert variant="default">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertDescription>
                      {t("binCountItems")}
                    </AlertDescription>
                </Alert>
            )}
          </div>
          {currentAlert && id && <Processes ref={processesRef} id={id} alert={currentAlert} reasonType={ReasonType.Counting}
                                            onCancel={handleCancel}
                                            onQuantityChanged={handleQuantityChanged}
                                            onUpdateLine={async (params) => {
                                              const result = await countingService.updateLine(params);
                                              return {returnValue: result};
                                            }}/>}
        </>
      )}
    </ContentTheme>
  );
}
