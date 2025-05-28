import * as React from 'react';
import {CSSProperties, useState} from 'react';
import {
  fetchGoodsReceiptValidateProcessLineDetails,
  GoodsReceiptValidateProcess,
  GoodsReceiptValidateProcessLine,
  GoodsReceiptValidateProcessLineDetails,
  ProcessLineStatus,
} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "../../../components/ThemeContext";
import {useDateTimeFormat} from "../../../Assets/DateFormat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Added DialogDescription
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {UnitType} from "../../../Assets/Common";
// import {formatValueByPack} from "../../../Assets/Quantities"; // Assuming this might be useful later or can be removed

// Interface for the new quantity row structure
interface QuantityRowProps {
  label: string;
  baseQuantity: number;
  numInBuy?: number;
  numInPurPack?: number;
  buyUnitMsrText: string;
  packUnitMsrText: string;
}

interface GoodsReceiptProcessDifferenceTableProps {
  id: number,
  data: GoodsReceiptValidateProcess,
}

// New component for rendering a single row in the quantity table
const QuantityDataRow: React.FC<QuantityRowProps> = ({
  label,
  baseQuantity,
  numInBuy,
  numInPurPack,
  buyUnitMsrText,
  packUnitMsrText,
}) => {
  const buyUnitsDisplay = (numInBuy && numInBuy !== 0) ? (baseQuantity / numInBuy).toFixed(2) : "N/A";
  const packUnitsDisplay = (numInBuy && numInBuy !== 0 && numInPurPack && numInPurPack !== 0) ? (baseQuantity / (numInBuy * numInPurPack)).toFixed(2) : "N/A";

  return (
    <div className="metric-row flex justify-between items-center py-2 border-b border-gray-200">
      <div className="w-[30%] font-medium">
        <span>{label}</span>
      </div>
      <div className="flex-1 flex justify-around text-center">
        <div className="flex-1">
          <span>{baseQuantity.toFixed(2)}</span>
        </div>
        <div className="flex-1">
          <span>{buyUnitsDisplay}</span>
        </div>
        <div className="flex-1">
          <span>{packUnitsDisplay}</span>
        </div>
      </div>
    </div>
  );
};


const GoodsReceiptProcessDifferenceTable: React.FC<GoodsReceiptProcessDifferenceTableProps> = (
  {
    id,
    data,
  }) => {
  const {t} = useTranslation();
  const {dateFormat, timeFormat} = useDateTimeFormat();
  const {setLoading, setError} = useThemeContext(); // Removed setAlert as it's not used

  const [expandedRowsData, setExpandedRowsData] = useState<{
    [key: number]: GoodsReceiptValidateProcessLineDetails[]
  }>({});

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);
  const [selectedLineForDetail, setSelectedLineForDetail] = useState<GoodsReceiptValidateProcessLine | null>(null);
  const [detailDataForDialog, setDetailDataForDialog] = useState<GoodsReceiptValidateProcessLineDetails[] | null>(null);


  const getStatusTextStyle = (status: ProcessLineStatus): CSSProperties => {
    // Returns text style properties for the status label
    switch (status) {
      case ProcessLineStatus.OK:
        return { color: '#155724', backgroundColor: '#d4edda', padding: '2px 6px', borderRadius: '4px', display: 'inline-block'}; // Green
      case ProcessLineStatus.LessScan: // More scanned than ordered
        return { color: '#721c24', backgroundColor: '#f8d7da', padding: '2px 6px', borderRadius: '4px', display: 'inline-block'}; // Red
      case ProcessLineStatus.MoreScan: // Less scanned than ordered
        return { color: '#856404', backgroundColor: '#fff3cd', padding: '2px 6px', borderRadius: '4px', display: 'inline-block'}; // Yellow
      case ProcessLineStatus.ClosedLine:
        return { color: '#0c5460', backgroundColor: '#d1ecf1', padding: '2px 6px', borderRadius: '4px', display: 'inline-block'}; // Light Blue
      default:
        return {padding: '2px 6px', borderRadius: '4px', display: 'inline-block'}; // Default style
    }
  };

  function getRowStatusLabel(status: ProcessLineStatus) {
    switch (status) {
      case ProcessLineStatus.OK:
        return t("complete");
      case ProcessLineStatus.LessScan:
        return t("moreThenOrdered"); // Assuming this means scanned > ordered
      case ProcessLineStatus.MoreScan:
        return t("lessThenOrdered"); // Assuming this means scanned < ordered
      case ProcessLineStatus.ClosedLine:
        return t("closed");
      case ProcessLineStatus.NotReceived:
        return t("notReceived");
      default:
        return '';
    }
  }

  const handleOpenDetailDialog = (line: GoodsReceiptValidateProcessLine) => {
    setSelectedLineForDetail(line);
    setLoading(true);
    if (expandedRowsData[line.lineNumber]) {
      setDetailDataForDialog(expandedRowsData[line.lineNumber]);
      setIsDetailDialogOpen(true);
      setLoading(false);
    } else {
      fetchGoodsReceiptValidateProcessLineDetails(id, data.baseType, data.baseEntry, line.baseLine)
        .then((details) => {
          setExpandedRowsData(prevState => ({
            ...prevState,
            [line.lineNumber]: details
          }));
          setDetailDataForDialog(details);
          setIsDetailDialogOpen(true);
        })
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
    }
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedLineForDetail(null);
    setDetailDataForDialog(null);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {data.lines.map((row) => {
        const numInBuy = row.numInBuy || 1;
        const purPackUn = row.purPackUn || 1;
        const buyUnitMsrText = row.buyUnitMsr || t('buyUnit');
        const packUnitMsrText = row.purPackMsr || t('packUnit');
        const statusTextStyle = getStatusTextStyle(row.lineStatus);

        return (
          <Card key={row.lineNumber} className="w-full shadow-lg">
            <CardHeader>
              <CardTitle>{`${t('code')}: ${row.itemCode}`}</CardTitle>
              <CardDescription>{`${t('description')}: ${row.itemName} (#${row.lineNumber})`}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              {/* Unit Headers */}
              <div className="flex justify-between items-center py-2 border-b-2 border-primary mb-2 font-bold">
                <div className="w-[30%]">
                  <span>{t('unit')}</span>
                </div>
                <div className="flex-1 flex justify-around text-center">
                  <div className="flex-1 text-xs">
                    <span>{t('units')}</span>
                  </div>
                  <div className="flex-1 text-xs">
                    <span>{buyUnitMsrText}</span>
                  </div>
                  <div className="flex-1 text-xs">
                    <span>{packUnitMsrText}</span>
                  </div>
                </div>
              </div>

              {/* Scanned Quantity Row */}
              <QuantityDataRow
                label={t('scannedQuantity')}
                baseQuantity={row.quantity}
                numInBuy={numInBuy}
                numInPurPack={purPackUn}
                buyUnitMsrText={buyUnitMsrText}
                packUnitMsrText={packUnitMsrText}
              />

              {/* Document Quantity Row */}
              <QuantityDataRow
                label={t('documentQuantity')}
                baseQuantity={row.openInvQty}
                numInBuy={numInBuy}
                numInPurPack={purPackUn}
                buyUnitMsrText={buyUnitMsrText}
                packUnitMsrText={packUnitMsrText}
              />

              <div className="my-4">
                <span className="font-bold">{t('status')}: </span>
                <span style={statusTextStyle}>{getRowStatusLabel(row.lineStatus)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="default"
                onClick={() => handleOpenDetailDialog(row)}
                className="w-full"
              >
                {t('details')}
              </Button>
            </CardFooter>
          </Card>
        );
      })}

      {selectedLineForDetail && isDetailDialogOpen && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-2xl"> {/* Increased width for details table */}
            <DialogHeader>
              <DialogTitle>{`${t('detailsFor')} ${selectedLineForDetail.itemCode} (#${selectedLineForDetail.lineNumber})`}</DialogTitle>
              <DialogDescription>{selectedLineForDetail.itemName}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <span className="font-bold">{`${t('status')}: `}</span>
                <span style={getStatusTextStyle(selectedLineForDetail.lineStatus)}>
                  {getRowStatusLabel(selectedLineForDetail.lineStatus)}
                </span>
              </div>

              {detailDataForDialog && detailDataForDialog.length > 0 ? (
                <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[25%]"><Label>{t('date')}</Label></TableHead>
                      <TableHead className="w-[20%]"><Label>{t('time')}</Label></TableHead>
                      <TableHead className="w-[30%]"><Label>{t('employee')}</Label></TableHead>
                      <TableHead className="w-[25%] text-right"><Label>{t('scannedQuantity')}</Label></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailDataForDialog.map((detail) => {
                      const timeStamp = new Date(detail.timeStamp);
                      let scannedQuantity = detail.scannedQuantity;
                      if (detail.unit !== UnitType.Unit && selectedLineForDetail.numInBuy) {
                        scannedQuantity /= selectedLineForDetail.numInBuy;
                      }
                      if (detail.unit === UnitType.Pack && selectedLineForDetail.purPackUn) {
                        scannedQuantity /= selectedLineForDetail.purPackUn;
                      }
                      return (
                        <TableRow key={`${detail.timeStamp}-${detail.employee}`}>
                          <TableCell><span>{dateFormat(timeStamp)}</span></TableCell>
                          <TableCell><span>{timeFormat(timeStamp)}</span></TableCell>
                          <TableCell><span>{detail.employee}</span></TableCell>
                          <TableCell className="text-right"><span>{scannedQuantity.toFixed(2)}</span></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">{t('noDetailsAvailable')}</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDetailDialog}>{t('close')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default GoodsReceiptProcessDifferenceTable;
