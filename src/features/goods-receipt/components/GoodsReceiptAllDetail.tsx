import React, {forwardRef, useImperativeHandle, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {GoodsReceiptAllLine} from "@/features/goods-receipt/data/goods-receipt-reports";
import {UnitType} from "@/features/shared/data/shared";
import {Card, CardContent} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import GoodsReceiptAllDetailSkeleton from "@/features/goods-receipt/components/GoodsReceiptAllDetailSkeleton";

import {
  GRPOAllDetailProps,
  useGoodsReceiptAllDetailsData
} from "@/features/goods-receipt/hooks/useGoodsReceiptAllDetailsData";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import InfoBox, {FullInfoBox, InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";
import {Label} from "@/components";
import {formatNumber} from "@/utils/number-utils";

const GoodsReceiptAllDialog = forwardRef((props: GRPOAllDetailProps, ref) => {
  const {t} = useTranslation();
  const {dateFormat, timeFormat} = useDateTimeFormat();
  const {
    isOpen,
    currentData,
    data,
    enableUpdate,
    checkedRows,
    quantityChanges,
    setCurrentData,
    showWithData,
    update,
    handleCheckboxChange,
    handleQuantityChange,
    setIsOpen
  } = useGoodsReceiptAllDetailsData(props);

  useImperativeHandle(ref, () => ({
    show(data: GoodsReceiptAllLine, details: any[], enableUpdate: boolean) {
      setCurrentData(data);
      showWithData(data, details, enableUpdate);
    }
  }));

  const displayBarcode = useMemo(() => !!(currentData && data && data.find((v) => v.package != null)), [currentData, data]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={displayBarcode ? "sm:max-w-4xl" : "sm:max-w-xl"}>
        <DialogHeader>
          <DialogTitle>{t("detail")}</DialogTitle>
          <DialogDescription>
            {currentData?.itemCode} - {currentData?.itemName}
          </DialogDescription>
        </DialogHeader>

        {currentData && data && data.length > 0 ? (
          <>
            {/* Mobile view - Card layout */}
            <div className="block sm:hidden">
              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-1 gap-2">
                  {data.map((row) => {
                    const displayUnit = row.unit === UnitType.Unit ? t('unit') :
                      row.unit === UnitType.Dozen ? (currentData?.buyUnitMsr || t("qtyInUn")) :
                        (currentData?.purPackMsr || t('packUn'));

                    let quantity = row.quantity;
                    if (row.unit !== UnitType.Unit) {
                      quantity /= currentData.numInBuy;
                    }
                    if (row.unit === UnitType.Pack) {
                      quantity /= currentData.purPackUn;
                    }

                    return (
                      <div key={row.lineId} className="bg-white rounded-lg shadow-sm mb-4 p-4">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{row.createdByUserName}</h3>
                          <p className="text-sm text-gray-600">{dateFormat(row.timeStamp)} • {timeFormat(row.timeStamp)}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">{t('unit')}:</span>
                            <span className="ml-2 font-medium">{displayUnit}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('quantity')}:</span>
                            {enableUpdate ? (
                              <Input
                                type="number"
                                className="w-20 text-center font-medium mt-1"
                                value={(quantityChanges[row.lineId] ?? quantity).toString()}
                                min={1}
                                step={1}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleQuantityChange(row.lineId, e.target.value)}
                              />
                            ) : (
                              <span className="ml-2 font-medium">{formatNumber(quantity, 0)}</span>
                            )}
                          </div>
                          {row.package && (
                            <div className="col-span-2">
                              <span className="text-gray-500">{t('package')}:</span>
                              <span className="ml-2 font-medium">{row.package.barcode}</span>
                            </div>
                          )}
                        </div>
                        
                        {enableUpdate && (
                          <div className="flex items-center pt-2 border-t border-gray-100">
                            <Checkbox
                              checked={checkedRows[row.lineId]}
                              onCheckedChange={(checked) => handleCheckboxChange(row.lineId, !!checked)}
                            />
                            <Label className="cursor-pointer pl-2"
                                   onClick={() => handleCheckboxChange(row.lineId, !checkedRows[row.lineId])}>
                              {t('delete')}
                            </Label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Desktop view - Table layout */}
            <div className="hidden sm:block">
              <ScrollArea className="h-[60vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('employee')}</TableHead>
                      <TableHead className="text-center">{t('date')}</TableHead>
                      <TableHead className="text-center">{t('time')}</TableHead>
                      <TableHead className="text-center">{t('unit')}</TableHead>
                      <TableHead className="text-center">{t('quantity')}</TableHead>
                      {displayBarcode && (
                        <TableHead className="text-center">{t('package')}</TableHead>
                      )}
                      {enableUpdate && (
                        <TableHead className="text-center">{t('delete')}</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => {
                      const displayUnit = row.unit === UnitType.Unit ? t('unit') :
                        row.unit === UnitType.Dozen ? (currentData?.buyUnitMsr || t("qtyInUn")) :
                          (currentData?.purPackMsr || t('packUn'));

                      let quantity = row.quantity;
                      if (row.unit !== UnitType.Unit) {
                        quantity /= currentData.numInBuy;
                      }
                      if (row.unit === UnitType.Pack) {
                        quantity /= currentData.purPackUn;
                      }

                      return (
                        <TableRow key={row.lineId}>
                          <TableCell>{row.createdByUserName}</TableCell>
                          <TableCell className="text-center">{dateFormat(row.timeStamp)}</TableCell>
                          <TableCell className="text-center">{timeFormat(row.timeStamp)}</TableCell>
                          <TableCell className="text-center">{displayUnit}</TableCell>
                          <TableCell className="text-center">
                            {enableUpdate ? (
                              <Input
                                type="number"
                                className="w-24 text-right mx-auto"
                                value={(quantityChanges[row.lineId] ?? quantity).toString()}
                                min={1}
                                step={1}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleQuantityChange(row.lineId, e.target.value)}
                              />
                            ) : (
                              formatNumber(quantity, 0)
                            )}
                          </TableCell>
                          {displayBarcode && (
                            <TableCell>{row.package?.barcode}</TableCell>
                          )}
                          {enableUpdate && (
                            <TableCell className="text-center">
                              <Checkbox
                                checked={checkedRows[row.lineId]}
                                onCheckedChange={(checked) => handleCheckboxChange(row.lineId, !!checked)}
                              />
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-muted-foreground">{t("noDetailsAvailable")}</p>
        )}

        <DialogFooter>
          {enableUpdate && (
            <Button onClick={update}>
              {t("update")}
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default GoodsReceiptAllDialog;
