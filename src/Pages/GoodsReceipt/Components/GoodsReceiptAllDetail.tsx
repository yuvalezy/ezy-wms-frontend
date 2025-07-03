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
import {GoodsReceiptAllLine} from "@/pages/GoodsReceipt/data/Report";
import {UnitType} from "@/assets/Common";
import {formatNumber} from "@/lib/utils";
import {Card, CardContent} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

import {
  GRPOAllDetailProps,
  useGoodsReceiptAllDetailsData
} from "@/pages/GoodsReceipt/data/goods-receipt-all-details-data";
import {useDateTimeFormat} from "@/assets/DateFormat";
import InfoBox, {InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";
import {Label} from "@/components";

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
    loadDetails,
    update,
    handleCheckboxChange,
    handleQuantityChange,
    setIsOpen
  } = useGoodsReceiptAllDetailsData(props);

  useImperativeHandle(ref, () => ({
    show(data: GoodsReceiptAllLine) {
      setCurrentData(data);
      loadDetails(data);
    }
  }));

  const displayBarcode = useMemo(() => currentData && data && data.find((v) => v.package != null), [currentData, data]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={displayBarcode ? "sm:max-w-4xl" : "sm:max-w-xl"}>
        <DialogHeader>
          <DialogTitle>{t("detail")}</DialogTitle>
          <DialogDescription>
            {currentData?.itemCode} - {currentData?.itemName}
          </DialogDescription>
        </DialogHeader>

        {currentData && data && data.length > 0 && (
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
                      <Card key={row.lineId}>
                        <CardContent>
                          <InfoBox>
                            <InfoBoxValue label={t('employee')} value={row.createdByUserName}/>
                            {row.package && <InfoBoxValue label={t('package')} value={row.package.barcode}/>}
                          </InfoBox>
                          <SecondaryInfoBox>
                            <InfoBoxValue label={t('date')} value={dateFormat(row.timeStamp)}/>
                            <InfoBoxValue label={t('time')} value={timeFormat(row.timeStamp)}/>
                            <InfoBoxValue label={t('unit')} value={displayUnit}/>
                            <InfoBoxValue label={t('quantity')} value={enableUpdate ? (
                              <Input
                                type="number"
                                className="w-24 text-right"
                                value={(quantityChanges[row.lineId] ?? quantity).toString()}
                                min={1}
                                step={1}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleQuantityChange(row.lineId, e.target.value)}
                              />
                            ) : (
                              <span className="text-right"> {formatNumber(quantity, 0)} </span>
                            )}/>
                          </SecondaryInfoBox>
                          {enableUpdate && (
                            <div className="flex items-center pt-2">
                              <Checkbox
                                checked={checkedRows[row.lineId]}
                                onCheckedChange={(checked) => handleCheckboxChange(row.lineId, !!checked)}
                              >
                                {t('delete')}
                              </Checkbox>
                              <Label className="cursor-pointer pl-2"
                                     onClick={() => handleCheckboxChange(row.lineId, !checkedRows[row.lineId])}>
                                {t('delete')}
                              </Label>
                            </div>
                          )}
                        </CardContent>
                      </Card>
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
        )}
        {(!data || data.length === 0) &&
            <p className="py-4 text-center text-muted-foreground">{t("noDetailsAvailable")}</p>}

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
