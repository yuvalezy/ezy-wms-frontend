import * as React from 'react';
import {CountingSummaryReportLine} from "@/pages/Counting/data/Report";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {MetricRow} from "@/components/MetricRow";
import {formatNumber} from "@/lib/utils";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface CountingSummaryReportTableProps {
  data: CountingSummaryReportLine[]
}

const CountingSummaryReportTable: React.FC<CountingSummaryReportTableProps> = ({data}) => {
  const {t} = useTranslation();

  return (
    <>
      {/* Mobile view - Cards */}
      <div className="block sm:hidden flex flex-col gap-4">
        {data.map((row) => (
          <Card key={`${row.itemCode}-${row.binCode}`} className="w-full shadow-lg">
            <CardHeader>
              <CardTitle>{`${t('bin')}: ${row.binCode}`}</CardTitle>
              <CardDescription>{`${t('code')}: ${row.itemCode} - ${t('description')}: ${row.itemName}`}</CardDescription>
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
                    <span>{t('dozens')}</span>
                  </div>
                  <div className="flex-1 text-xs">
                    <span>{t('packs')}</span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <MetricRow
                label={t('counted')}
                values={{
                  units: formatNumber(row.unit, 0),
                  buyUnits: formatNumber(row.dozen, 0), // Mapping dozen to buyUnits
                  packUnits: formatNumber(row.pack, 0) // Mapping pack to packUnits
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('bin')}</TableHead>
              <TableHead>{t('code')}</TableHead>
              <TableHead>{t('description')}</TableHead>
              <TableHead className="text-center border-l" colSpan={3}>{t('counted')}</TableHead>
            </TableRow>
            <TableRow>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead className="text-center border-l">{t('units')}</TableHead>
              <TableHead className="text-center">{t('dozens')}</TableHead>
              <TableHead className="text-center border-r">{t('packs')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={`${row.itemCode}-${row.binCode}`}>
                <TableCell>{row.binCode}</TableCell>
                <TableCell>{row.itemCode}</TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell className="text-center border-l">{formatNumber(row.unit, 0)}</TableCell>
                <TableCell className="text-center">{formatNumber(row.dozen, 0)}</TableCell>
                <TableCell className="text-center border-r">{formatNumber(row.pack, 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default CountingSummaryReportTable;
