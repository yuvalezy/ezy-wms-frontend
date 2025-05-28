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
import {Label} from "@/components/ui/label";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {GoodsReceiptAll} from "../Data/Report";
import {UnitType} from "@/assets/Common";
import {formatNumber} from "@/lib/utils";

import {
  GRPOAllDetailProps,
  useGoodsReceiptAllDetailsData
} from "@/pages/GoodsReceipt/Data/goods-receipt-all-details-data";
import {useDateTimeFormat} from "@/assets/DateFormat";

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
      <DialogContent className="sm:max-w-xl"> {/* Adjusted width */}
        <DialogHeader>
          <DialogTitle>{t("detail")}</DialogTitle>
          <DialogDescription>
            {currentData?.itemCode} - {currentData?.itemName}
          </DialogDescription>
        </DialogHeader>

        {currentData && data && data.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto py-4"> {/* Scrollable area for table */}
            <Table>
              <TableHeader>
                <TableRow>
                  {enableUpdate && <TableHead className="w-[50px]"><Label>{t('delete')}</Label></TableHead>}
                  <TableHead><Label>{t('employee')}</Label></TableHead>
                  <TableHead><Label>{t('date')}</Label></TableHead>
                  <TableHead><Label>{t('time')}</Label></TableHead>
                  <TableHead className="text-right"><Label>{t('quantity')}</Label></TableHead>
                  <TableHead><Label>{t('unit')}</Label></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => {
                  let displayQuantity = row.quantity;
                  // Apply quantity adjustments based on unit type for display
                  if (row.unit !== UnitType.Unit && currentData?.numInBuy) {
                    displayQuantity /= currentData.numInBuy;
                  }
                  if (row.unit === UnitType.Pack && currentData?.purPackUn) {
                    displayQuantity /= currentData.purPackUn;
                  }
                  // Use quantityChanges for the input value if it exists for this row
                  const currentQuantityValue = quantityChanges[row.lineID] !== undefined
                    ? quantityChanges[row.lineID]
                    : displayQuantity;

                  return (
                    <TableRow key={row.lineID}>
                      {enableUpdate && (
                        <TableCell>
                          <Checkbox
                            checked={!!checkedRows[row.lineID]}
                            onCheckedChange={(checked) => handleCheckboxChange(row.lineID, !!checked)}
                          />
                        </TableCell>
                      )}
                      <TableCell>{row.employeeName}</TableCell>
                      <TableCell>{dateFormat(row.timeStamp)}</TableCell>
                      <TableCell>{timeFormat(row.timeStamp)}</TableCell>
                      <TableCell className="text-right">
                        {enableUpdate ? (
                          <Input
                            type="number"
                            className="w-20 text-right"
                            value={currentQuantityValue.toString()}
                            onChange={(e) => handleQuantityChange(row.lineID, e.target.value)}
                          />
                        ) : (
                          formatNumber(currentQuantityValue, 2) // Display formatted quantity if not updating
                        )}
                      </TableCell>
                      <TableCell>
                        {row.unit === UnitType.Unit ? t('unit') :
                          row.unit === UnitType.Dozen ? (currentData?.buyUnitMsr || t('purPackUn')) :
                            (currentData?.purPackMsr || t('packUn'))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
