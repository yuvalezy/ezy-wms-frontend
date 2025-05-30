import React, {forwardRef, useImperativeHandle} from "react";
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
import {GoodsReceiptAll} from "@/pages/GoodsReceipt/data/Report";
import {UnitType} from "@/assets/Common";
import {formatNumber} from "@/lib/utils";
import {Card, CardContent} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";

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
    show(data: GoodsReceiptAll) {
      setCurrentData(data);
      loadDetails(data);
    }
  }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("detail")}</DialogTitle>
          <DialogDescription>
            {currentData?.itemCode} - {currentData?.itemName}
          </DialogDescription>
        </DialogHeader>

        {currentData && data && data.length > 0 && (
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 gap-2">
              {data.map((row) => {
                let displayQuantity = row.quantity;
                if (row.unit !== UnitType.Unit && currentData?.numInBuy) {
                  displayQuantity /= currentData.numInBuy;
                }
                if (row.unit === UnitType.Pack && currentData?.purPackUn) {
                  displayQuantity /= currentData.purPackUn;
                }
                const currentQuantityValue = quantityChanges[row.lineID] !== undefined
                  ? quantityChanges[row.lineID]
                  : displayQuantity;
                const displayUnit = row.unit === UnitType.Unit ? t('unit') :
                  row.unit === UnitType.Dozen ? (currentData?.buyUnitMsr || t("qtyInUn")) :
                    (currentData?.purPackMsr || t('packUn'));

                return (
                  <Card key={row.lineID}>
                    <CardContent>
                      <InfoBox>
                        <InfoBoxValue label={t('employee')} value={row.employeeName}/>
                      </InfoBox>
                      <SecondaryInfoBox>
                        <InfoBoxValue label={t('date')} value={dateFormat(row.timeStamp)}/>
                        <InfoBoxValue label={t('time')} value={timeFormat(row.timeStamp)}/>
                        <InfoBoxValue label={t('unit')} value={displayUnit}/>
                        <InfoBoxValue label={t('quantity')} value={enableUpdate ? (
                          <Input
                            type="number"
                            className="w-24 text-right"
                            value={currentQuantityValue.toString()}
                            min={1}
                            step={1}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleQuantityChange(row.lineID, e.target.value)}
                          />
                        ) : (
                          <span className="text-right">
                                {formatNumber(currentQuantityValue, 2)}
                              </span>
                        )}/>
                      </SecondaryInfoBox>
                      {enableUpdate && (
                        <div className="flex items-center pt-2">
                          <Checkbox
                            checked={checkedRows[row.lineID]}
                            onCheckedChange={(checked) => handleCheckboxChange(row.lineID, !!checked)}
                          >
                            {t('delete')}
                          </Checkbox>
                          <Label className="cursor-pointer pl-2"
                                 onClick={() => handleCheckboxChange(row.lineID, !checkedRows[row.lineID])}>
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
