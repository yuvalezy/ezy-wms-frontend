import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
import {useThemeContext} from "../../../components/ThemeContext";
import {useTranslation} from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {fetchGoodsReceiptReportAllDetails, GoodsReceiptAll, GoodsReceiptAllDetail} from "../Data/Report";
import {fetchDocuments} from "../Data/Document";
import {DetailUpdateParameters, Status, UnitType} from "../../../Assets/Common";
import {useDateTimeFormat} from "../../../Assets/DateFormat";
import {formatNumber} from "@/lib/utils";

export interface GRPOAllDetailRef {
  show: (data: GoodsReceiptAll) => void;
}

export interface GRPOAllDetailProps {
  id: number;
  onUpdate: (data: DetailUpdateParameters) => void;
}

const GoodsReceiptAllDialog = forwardRef((props: GRPOAllDetailProps, ref) => {
  const {t} = useTranslation();
  const {dateFormat, timeFormat} = useDateTimeFormat();
  const {setLoading, setError} = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [currentData, setCurrentData] = useState<GoodsReceiptAll | null>(null);
  const [data, setData] = useState<GoodsReceiptAllDetail[] | null>([]);
  const [enableUpdate, setEnableUpdate] = useState(false);
  const [checkedRows, setCheckedRows] = useState<{ [key: number]: boolean }>({}); // State to store checked rows
  const [quantityChanges, setQuantityChanges] = useState<{ [key: number]: number }>({}); // State to store quantity changes

  function update() {
    try {
      const removeRows = data?.filter(detail => checkedRows[detail.lineID]).map(detail => detail.lineID) ?? [];
      setIsOpen(false);
      props.onUpdate({id: props.id, removeRows: removeRows, quantityChanges: quantityChanges});
    } catch (e) {
      setError(e);
    }
  }

  function loadDetails(data: GoodsReceiptAll) {
    setLoading(true);
    setEnableUpdate(false);
    setCheckedRows({})
    setQuantityChanges({})
    fetchDocuments({id: props.id})
      .then((doc) => {
        setEnableUpdate(doc[0].status === Status.InProgress);
        fetchGoodsReceiptReportAllDetails(props.id, data.itemCode)
          .then((result) => {
            setIsOpen(true);
            setData(result);
          })
          .catch((error) => setError(error))
          .finally(() => setLoading(false));
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }

  useImperativeHandle(ref, () => ({
    show(data: GoodsReceiptAll) {
      setCurrentData(data);
      loadDetails(data);
    }
  }));

  function handleCheckboxChange(lineID: number, checked: boolean) {
    setCheckedRows(prevState => ({
      ...prevState,
      [lineID]: checked
    }));
    // setEnableUpdate(true); // This might not be needed if button is always enabled or logic changes
  }

  function handleQuantityChange(lineID: number, newValue: string) {
    const numValue = parseInt(newValue, 10);
    setQuantityChanges(prevState => ({
      ...prevState,
      [lineID]: isNaN(numValue) ? 0 : numValue,
    }));
     // setEnableUpdate(true); // This might not be needed
  }

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
        {(!data || data.length === 0) && <p className="py-4 text-center text-muted-foreground">{t("noDetailsAvailable")}</p>}

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
