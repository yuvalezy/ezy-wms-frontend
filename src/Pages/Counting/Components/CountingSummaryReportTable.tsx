import * as React from 'react';
import {CountingSummaryReportLine} from "@/pages/Counting/data/Report";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {MetricRow} from "@/components/MetricRow";
import {formatNumber} from "@/lib/utils";

interface CountingSummaryReportTableProps {
  data: CountingSummaryReportLine[]
}

const CountingSummaryReportTable: React.FC<CountingSummaryReportTableProps> = ({data}) => {
  const {t} = useTranslation();

  return (
    <div className="flex flex-col gap-4">
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
  );
}

export default CountingSummaryReportTable;
