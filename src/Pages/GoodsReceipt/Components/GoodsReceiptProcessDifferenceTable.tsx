import * as React from 'react';
import {
  fetchGoodsReceiptValidateProcessLineDetails, GoodsReceiptValidateProcess,
  GoodsReceiptValidateProcessLine, GoodsReceiptValidateProcessLineDetails,
  ProcessLineStatus,
} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Icon, Label, Table, TableCell, TableColumn, TableGroupRow, TableRow} from '@ui5/webcomponents-react';
import {CSSProperties, useState} from "react";
import {useThemeContext} from "../../../Components/ThemeContext";
import {useDateTimeFormat} from "../../../Assets/DateFormat";
import {formatValueByPack} from "../../../Assets/Quantities";


interface GoodsReceiptProcessDifferenceTableProps {
  id: number,
  data: GoodsReceiptValidateProcess,
  displayPackage: boolean
}

const GoodsReceiptProcessDifferenceTable: React.FC<GoodsReceiptProcessDifferenceTableProps> = (
  {
    id,
    data,
    displayPackage
  }) => {
  const {t} = useTranslation();
  const {dateFormat, timeFormat} = useDateTimeFormat();
  const {setLoading, setAlert, setError} = useThemeContext();
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});
  const [expandedRowsData, setExpandedRowsData] = useState<{
    [key: number]: GoodsReceiptValidateProcessLineDetails[]
  }>({});

  const toggleRow = (line: GoodsReceiptValidateProcessLine) => {
    const lineNumber = line.lineNumber;

    function expandCollapse() {
      setExpandedRows(prevState => ({
        ...prevState,
        [lineNumber]: !prevState[lineNumber]
      }));
    }

    if (lineNumber in expandedRowsData) {
      expandCollapse();
      return;
    }
    setLoading(true);
    fetchGoodsReceiptValidateProcessLineDetails(id, data.baseType, data.baseEntry, line.baseLine)
      .then((details) => {
        setExpandedRowsData(prevState => ({
          ...prevState,
          [lineNumber]: details
        }));
        expandCollapse();
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  };


  const getRowStyle = (status: ProcessLineStatus): CSSProperties => {
    let props: CSSProperties = {cursor: "pointer"}
    switch (status) {
      case ProcessLineStatus.OK:
        props.backgroundColor = '#d4edda';// Green
        break;
      case ProcessLineStatus.LessScan:
        props.backgroundColor = '#f8d7da';// Red
        break;
      case ProcessLineStatus.MoreScan:
        props.backgroundColor = '#fff3cd';// Yellow
        break;
      case ProcessLineStatus.ClosedLine:
        props.backgroundColor = '#d1ecf1';// Light Blue
        break;
      default:
    }
    return props;
  };

  function getRowStatusLabel(status: ProcessLineStatus) {
    switch (status) {
      case ProcessLineStatus.OK:
        return t("complete");
      case ProcessLineStatus.LessScan:
        return t("moreThenOrdered");
      case ProcessLineStatus.MoreScan:
        return t("lessThenOrdered");
      case ProcessLineStatus.ClosedLine:
        return t("closed");
      case ProcessLineStatus.NotReceived:
        return t("notReceived");
      default:
        return '';
    }
  }

  return (
    <Table
      columns={<>
        <TableColumn><Label></Label></TableColumn>
        <TableColumn><Label>#</Label></TableColumn>
        <TableColumn><Label>{t('code')}</Label></TableColumn>
        <TableColumn><Label>{t('description')}</Label></TableColumn>
        <TableColumn><Label>{t('scannedQuantity')}</Label></TableColumn>
        <TableColumn><Label>{t('documentQuantity')}</Label></TableColumn>
        <TableColumn><Label>{t('status')}</Label></TableColumn>
      </>}
    >
      {data.lines.map((row) => (
        <>
          <TableRow onClick={() => toggleRow(row)} key={row.lineNumber}>
            <TableCell style={getRowStyle(row.lineStatus)}>
              <Icon name={expandedRows[row.lineNumber] ? "arrow-bottom" : "arrow-right"}/>
            </TableCell>
            <TableCell style={getRowStyle(row.lineStatus)}><Label>{row.lineNumber}</Label></TableCell>
            <TableCell style={getRowStyle(row.lineStatus)}><Label>{row.itemCode}</Label></TableCell>
            <TableCell style={getRowStyle(row.lineStatus)}><Label>{row.itemName}</Label></TableCell>
            <TableCell style={getRowStyle(row.lineStatus)}><Label>{formatValueByPack(row.quantity, row.packUnit, displayPackage)}</Label></TableCell>
            <TableCell style={getRowStyle(row.lineStatus)}><Label>{formatValueByPack(row.openInvQty, row.packUnit, displayPackage)}</Label></TableCell>
            <TableCell
              style={getRowStyle(row.lineStatus)}><Label>{getRowStatusLabel(row.lineStatus)}</Label></TableCell>
          </TableRow>
          {expandedRows[row.lineNumber] && expandedRowsData[row.lineNumber] && (
            <TableGroupRow>
              <Table
                columns={<>
                  <TableColumn><Label>{t('date')}</Label></TableColumn>
                  <TableColumn><Label>{t('time')}</Label></TableColumn>
                  <TableColumn><Label>{t('employee')}</Label></TableColumn>
                  <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                  <TableColumn><Label>{t('scannedQuantity')}</Label></TableColumn>
                </>}
              >
                {expandedRowsData[row.lineNumber].map((detail) => {
                    let timeStamp = new Date(detail.timeStamp);
                    return <TableRow key={detail.timeStamp}>
                      <TableCell><Label>{dateFormat(timeStamp)}</Label></TableCell>
                      <TableCell><Label>{timeFormat(timeStamp)}</Label></TableCell>
                      <TableCell><Label>{detail.employee}</Label></TableCell>
                      <TableCell><Label>{detail.quantity}</Label></TableCell>
                      <TableCell><Label>{detail.scannedQuantity}</Label></TableCell>
                    </TableRow>
                  }
                )}
              </Table>
            </TableGroupRow>)}
        </>
      ))}
    </Table>
  );
}

export default GoodsReceiptProcessDifferenceTable;