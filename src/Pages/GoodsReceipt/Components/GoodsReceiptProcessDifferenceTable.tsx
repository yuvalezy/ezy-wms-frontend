import * as React from 'react';
import {CSSProperties, useState} from 'react';
import {
  fetchGoodsReceiptValidateProcessLineDetails,
  GoodsReceiptValidateProcess,
  GoodsReceiptValidateProcessLine,
  GoodsReceiptValidateProcessLineDetails,
  ProcessLineStatus,
} from "@/pages/GoodsReceipt/data/Report";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {useDateTimeFormat} from "@/assets/DateFormat";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"; // Added DialogDescription
import {ScrollArea} from "@/components/ui/scroll-area";
import {UnitType} from "@/assets/Common";
import {formatNumber} from "@/lib/utils";
import {MetricRow} from "@/components/MetricRow";
import InfoBox, {InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";

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
        return {
          color: '#155724',
          backgroundColor: '#d4edda',
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block'
        }; // Green
      case ProcessLineStatus.LessScan: // More scanned than ordered
        return {
          color: '#721c24',
          backgroundColor: '#f8d7da',
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block'
        }; // Red
      case ProcessLineStatus.MoreScan: // Less scanned than ordered
        return {
          color: '#856404',
          backgroundColor: '#fff3cd',
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block'
        }; // Yellow
      case ProcessLineStatus.ClosedLine:
        return {
          color: '#0c5460',
          backgroundColor: '#d1ecf1',
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block'
        }; // Light Blue
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
    <div className="flex flex-col gap-2">
      {data.lines.map((row) => {
        const statusTextStyle = getStatusTextStyle(row.lineStatus);

        return (
          <Card key={row.lineNumber}>
            <CardHeader>
              <CardTitle>{`${t('code')}: ${row.itemCode}`}</CardTitle>
              <CardDescription>{`${t('description')}: ${row.itemName} (#${row.lineNumber})`}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Unit Headers */}
              <div className="flex justify-between items-center border-b-2 border-primary font-bold">
                <div className="w-[30%]">
                  <span>{t('unit')}</span>
                </div>
                <div className="flex-1 flex justify-around text-center">
                  <div className="flex-1 text-xs">
                    <span>{t('units')}</span>
                  </div>
                  <div className="flex-1 text-xs">
                    <span>{row.buyUnitMsr ?? t("qtyInUn")}</span>
                  </div>
                  <div className="flex-1 text-xs">
                    <span>{row.purPackMsr ?? t('packUn')}</span>
                  </div>
                </div>
              </div>

              {/* Scanned Quantity Row */}
              <MetricRow
                label={t('scannedQuantity')}
                values={{
                  units: formatNumber(row.quantity, 0),
                  buyUnits: formatNumber(row.quantity / row.numInBuy),
                  packUnits: formatNumber(row.quantity / row.numInBuy / row.purPackUn)
                }}
              />

              {/* Document Quantity Row */}
              <MetricRow
                label={t('documentQuantity')}
                values={{
                  units: formatNumber(row.openInvQty, 0),
                  buyUnits: formatNumber(row.openInvQty / row.numInBuy),
                  packUnits: formatNumber(row.openInvQty / row.numInBuy / row.purPackUn)
                }}
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
          <DialogContent className="sm:max-w-xl">
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
                <ScrollArea className="h-[40vh]">
                  <div className="space-y-2">
                    {detailDataForDialog.map((detail) => {
                      const timeStamp = new Date(detail.timeStamp);
                      let scannedQuantity = detail.scannedQuantity;
                      if (selectedLineForDetail?.numInBuy && detail.unit !== UnitType.Unit && selectedLineForDetail.numInBuy !== 0) {
                        scannedQuantity /= selectedLineForDetail.numInBuy;
                      }
                      if (selectedLineForDetail?.purPackUn && detail.unit === UnitType.Pack && selectedLineForDetail.purPackUn !== 0) {
                        scannedQuantity /= selectedLineForDetail.purPackUn;
                      }

                      const displayUnit = selectedLineForDetail?.unit === UnitType.Unit ? t('unit') :
                        selectedLineForDetail?.unit === UnitType.Dozen ? (selectedLineForDetail?.buyUnitMsr || t("qtyInUn")) :
                          (selectedLineForDetail?.purPackMsr || t('packUn'));
                      return (
                        <Card
                          key={`${detail.timeStamp}-${detail.employee}-${detail.scannedQuantity}`}> {/* Adjusted key for more uniqueness */}
                          <CardContent>
                            <SecondaryInfoBox>
                              <InfoBoxValue label={t('date')} value={dateFormat(timeStamp)}/>
                              <InfoBoxValue label={t('time')} value={timeFormat(timeStamp)}/>
                              <InfoBoxValue label={t('employee')} value={detail.employee}/>
                              <InfoBoxValue label={t('unit')} value={displayUnit}/>
                            </SecondaryInfoBox>
                            <InfoBox>
                              <InfoBoxValue label={t('scannedQuantity')} value={formatNumber(scannedQuantity, 2)}/>
                            </InfoBox>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
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
