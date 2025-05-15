import * as React from 'react';
import {CountingSummaryReportLine} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Label, Table, TableCell, TableColumn, TableGroupRow, TableRow} from '@ui5/webcomponents-react';

interface CountingSummaryReportTableProps {
  data: CountingSummaryReportLine[]
}

const CountingSummaryReportTable: React.FC<CountingSummaryReportTableProps> = ({data}) => {
  const {t} = useTranslation();

  return (
    <Table
      columns={<>
        <TableColumn><Label>{t('bin')}</Label></TableColumn>
        <TableColumn><Label>{t('code')}</Label></TableColumn>
        <TableColumn><Label>{t('units')}</Label></TableColumn>
        <TableColumn><Label>{t('dozens')}</Label></TableColumn>
        <TableColumn><Label>{t('packs')}</Label></TableColumn>
      </>}
    >
      {data.map((row) => (
        <>
          <TableRow key={row.itemCode + row.binCode}>
            <TableCell><Label>{row.binCode}</Label></TableCell>
            <TableCell><Label>{row.itemCode}</Label></TableCell>
            <TableCell><Label>{row.unit}</Label></TableCell>
            <TableCell><Label>{row.dozen}</Label></TableCell>
            <TableCell><Label>{row.pack}</Label></TableCell>
          </TableRow>
          <TableGroupRow key={`group-${row.itemCode}-${row.binCode}`}>
            {t('description')}: {row.itemName}
          </TableGroupRow>
        </>
      ))}
    </Table>
  );
}

export default CountingSummaryReportTable;