import * as React from 'react';
import {CountingSummaryReportLine} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label"; // Using shadcn Label

interface CountingSummaryReportTableProps {
  data: CountingSummaryReportLine[]
}

const CountingSummaryReportTable: React.FC<CountingSummaryReportTableProps> = ({data}) => {
  const {t} = useTranslation();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Label>{t('bin')}</Label></TableHead>
            <TableHead><Label>{t('code')}</Label></TableHead>
            <TableHead className="text-right"><Label>{t('units')}</Label></TableHead>
            <TableHead className="text-right"><Label>{t('dozens')}</Label></TableHead>
            <TableHead className="text-right"><Label>{t('packs')}</Label></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <React.Fragment key={`${row.itemCode}-${row.binCode}`}>
              <TableRow>
                <TableCell><Label>{row.binCode}</Label></TableCell>
                <TableCell><Label>{row.itemCode}</Label></TableCell>
                <TableCell className="text-right"><Label>{row.unit}</Label></TableCell>
                <TableCell className="text-right"><Label>{row.dozen}</Label></TableCell>
                <TableCell className="text-right"><Label>{row.pack}</Label></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="py-1 px-2 text-sm text-muted-foreground">
                  {t('description')}: {row.itemName}
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default CountingSummaryReportTable;
