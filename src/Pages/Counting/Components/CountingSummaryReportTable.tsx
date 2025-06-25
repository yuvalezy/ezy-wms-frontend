import * as React from 'react';
import {CountingSummaryReportLine} from "@/pages/Counting/data/Report";
import {useTranslation} from "react-i18next";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";
import InfoBox, {InfoBoxValue} from "@/components/InfoBox";
import ItemDetailsLink from "@/components/ItemDetailsLink";

interface CountingSummaryReportTableProps {
  data: CountingSummaryReportLine[]
}

const CountingSummaryReportTable: React.FC<CountingSummaryReportTableProps> = ({data}) => {
  const {t} = useTranslation();
  const stockInfo = useStockInfo();
  return (
    <>
      {/* Mobile view - Cards */}
      <div className="sm:hidden flex flex-col gap-4">
        {data.map((row) => (
          <Card key={`${row.itemCode}-${row.binCode}`} className="w-full shadow-lg">
            <CardContent>
              <InfoBox>
                <InfoBoxValue label={t('bin')} value={row.binCode} />
                <InfoBoxValue label={t('code')} value={row.itemCode} itemDetailsLink={row}  />
                <InfoBoxValue label={t('description')} value={row.itemName} />
                <InfoBoxValue label={t('quantity')} value={stockInfo({
                    quantity: row.quantity,
                    numInBuy: row.numInBuy,
                    buyUnitMsr: row.buyUnitMsr || "",
                    purPackUn: row.purPackUn,
                    purPackMsr: row.purPackMsr || "",
                  })} />
              </InfoBox>
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
              <TableHead>{t('counted')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={`${row.itemCode}-${row.binCode}`}>
                <TableCell>{row.binCode}</TableCell>
                <TableCell>
                  <ItemDetailsLink data={row}/>
                </TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell>
                  {stockInfo({
                    quantity: row.quantity,
                    numInBuy: row.numInBuy,
                    buyUnitMsr: row.buyUnitMsr,
                    purPackUn: row.purPackUn,
                    purPackMsr: row.purPackMsr,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default CountingSummaryReportTable;
