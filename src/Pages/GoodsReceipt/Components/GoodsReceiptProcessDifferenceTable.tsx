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
import {
  Bar,
  Button,
  Card,
  CardHeader,
  Dialog,
  Label,
  Table,
  TableCell,
  TableColumn,
  TableRow,
  Text,
  Title
} from '@ui5/webcomponents-react';
import {useThemeContext} from "../../../Components/ThemeContext";
import {useDateTimeFormat} from "../../../Assets/DateFormat";
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
    <div className="metric-row" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #e0e0e0'
    }}>
      <div style={{flex: '0 0 30%', fontWeight: '500'}}>
        <Text>{label}</Text>
      </div>
      <div style={{flex: '1', display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
        <div style={{flex: '1'}}>
          <Text>{baseQuantity.toFixed(2)}</Text>
        </div>
        <div style={{flex: '1'}}>
          <Text>{buyUnitsDisplay}</Text>
        </div>
        <div style={{flex: '1'}}>
          <Text>{packUnitsDisplay}</Text>
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
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px'}}>
      {data.lines.map((row) => {
        // const cardStyle = getRowStyleProperties(row.lineStatus); // Card style removed based on feedback
        // Assuming GoodsReceiptValidateProcessLine has these fields based on GoodsReceiptAllTable and prompt
        // Fallback to 1 if undefined or zero to avoid division by zero, or handle more gracefully
        const numInBuy = row.numInBuy || 1; // Default to 1 if 0 or undefined to prevent division by zero
        const purPackUn = row.purPackUn || 1; // Default to 1

        const buyUnitMsrText = row.buyUnitMsr || t('buyUnit');
        const packUnitMsrText = row.purPackMsr || t('packUnit');
        const statusTextStyle = getStatusTextStyle(row.lineStatus);


        return (
          <Card
            key={row.lineNumber}
            style={{width: '100%'}} // Removed ...cardStyle
            header={
              <CardHeader
                titleText={`${t('code')}: ${row.itemCode}`}
                subtitleText={`${t('description')}: ${row.itemName} (#${row.lineNumber})`}
              />
            }
          >
            <div style={{padding: '16px'}}>
              {/* Unit Headers */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '2px solid #0070f3', // Theme primary color or a fixed one
                marginBottom: '8px',
                fontWeight: 'bold'
              }}>
                <div style={{flex: '0 0 30%'}}>
                  <Text style={{fontWeight: 'bold'}}>{t('unit')}</Text>
                </div>
                <div style={{flex: '1', display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
                  <div style={{flex: '1'}}>
                    <Text style={{fontWeight: 'bold', fontSize: '12px'}}>{t('units')}</Text>
                  </div>
                  <div style={{flex: '1'}}>
                    <Text style={{fontWeight: 'bold', fontSize: '12px'}}>
                      {buyUnitMsrText}
                    </Text>
                  </div>
                  <div style={{flex: '1'}}>
                    <Text style={{fontWeight: 'bold', fontSize: '12px'}}>
                      {packUnitMsrText}
                    </Text>
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

              <div style={{marginTop: '16px', marginBottom: '16px'}}>
                <Text style={{fontWeight: 'bold'}}>{t('status')}: </Text>
                <Text style={statusTextStyle}>{getRowStatusLabel(row.lineStatus)}</Text>
              </div>

              <Button
                design="Emphasized"
                onClick={() => handleOpenDetailDialog(row)}
                style={{width: '100%'}}
              >
                {t('details')}
              </Button>
            </div>
          </Card>
        );
      })}

      {selectedLineForDetail && isDetailDialogOpen && (
        <Dialog
          open={isDetailDialogOpen}
          onAfterClose={handleCloseDetailDialog}
          header={
            <Bar endContent={<Button icon="decline" design="Transparent" onClick={handleCloseDetailDialog}/>}>
              <Title>{`${t('detailsFor')} ${selectedLineForDetail.itemCode} (#${selectedLineForDetail.lineNumber})`}</Title>
            </Bar>
          }
          footer={
            <Bar endContent={<Button onClick={handleCloseDetailDialog}>{t('close')}</Button>}/>
          }
        >
          <div style={{padding: '1rem', minWidth: '500px'}}>
            <Title level="H5" style={{marginBottom: '0.5rem'}}>{selectedLineForDetail.itemName}</Title>
            
            <div style={{marginBottom: '1rem'}}>
              <Text style={{fontWeight: 'bold'}}>{`${t('status')}: `}</Text>
              <Text style={getStatusTextStyle(selectedLineForDetail.lineStatus)}>
                {getRowStatusLabel(selectedLineForDetail.lineStatus)}
              </Text>
            </div>

            {detailDataForDialog && detailDataForDialog.length > 0 ? (
              <Table
                columns={<>
                  <TableColumn style={{width: '25%'}}><Label>{t('date')}</Label></TableColumn>
                  <TableColumn style={{width: '20%'}}><Label>{t('time')}</Label></TableColumn>
                  <TableColumn style={{width: '30%'}}><Label>{t('employee')}</Label></TableColumn>
                  <TableColumn style={{width: '25%', textAlign: 'right'}}><Label>{t('scannedQuantity')}</Label></TableColumn>
                  {/* Original had 'quantity' and 'scannedQuantity', assuming 'scannedQuantity' from details is the relevant one */}
                </>}
              >
                {detailDataForDialog.map((detail) => {
                  const timeStamp = new Date(detail.timeStamp);
                  let scannedQuantity = detail.scannedQuantity;
                  if (detail.unit !== UnitType.Unit)
                    scannedQuantity /= selectedLineForDetail.numInBuy;
                  if (detail.unit === UnitType.Pack)
                    scannedQuantity /= selectedLineForDetail.purPackUn;
                  return (
                    <TableRow key={detail.timeStamp + detail.employee}> {/* Added employee to key for more uniqueness */}
                      <TableCell><Text>{dateFormat(timeStamp)}</Text></TableCell>
                      <TableCell><Text>{timeFormat(timeStamp)}</Text></TableCell>
                      <TableCell><Text>{detail.employee}</Text></TableCell>
                      <TableCell style={{textAlign: 'right'}}><Text>{scannedQuantity}</Text></TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            ) : (
              <Text>{t('noDetailsAvailable')}</Text>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default GoodsReceiptProcessDifferenceTable;
