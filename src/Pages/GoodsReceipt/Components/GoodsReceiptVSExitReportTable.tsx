import * as React from 'react';
import {GoodsReceiptVSExitReportDataLine} from "@/pages/GoodsReceipt/data/Report";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {MetricRow} from "@/components/MetricRow";
import {formatNumber} from "@/lib/utils";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface GoodsReceiptVSExitReportTableProps {
  data: GoodsReceiptVSExitReportDataLine[]
}

const GoodsReceiptVSExitReportTable: React.FC<GoodsReceiptVSExitReportTableProps> = ({data}) => {
  const {t} = useTranslation();

  return (
    <>
      {/* Mobile View - Card Layout */}
      <div className="block sm:hidden gap-2">
        {data.map((row, index) => {
          return <Card key={index}>
            <CardHeader>
              <CardTitle>{`${t('code')}: ${row.itemCode}`}</CardTitle>
              <CardDescription>{`${t('description')}: ${row.itemName}`}</CardDescription>
            </CardHeader>
            <CardContent>
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
              <MetricRow
                label={t('openQuantity')}
                values={{
                  units: formatNumber(row.openQuantity, 0),
                  buyUnits: formatNumber(row.openQuantity / row.numInBuy),
                  packUnits: formatNumber(row.openQuantity / row.numInBuy / row.purPackUn)
                }}
              />
              <MetricRow
                label={t('quantity')}
                values={{
                  units: formatNumber(row.quantity, 0),
                  buyUnits: formatNumber(row.quantity / row.numInBuy),
                  packUnits: formatNumber(row.quantity / row.numInBuy / row.purPackUn)
                }}
              />
            </CardContent>
          </Card>
        })}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2}>{t('code')}</TableHead>
              <TableHead rowSpan={2}>{t('description')}</TableHead>
              <TableHead colSpan={3} className="text-center border-l">{t('openQuantity')}</TableHead>
              <TableHead colSpan={3} className="text-center border-l">{t('quantity')}</TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="text-center border-l">{t('units')}</TableHead>
              <TableHead className="text-center">{t("qtyInUn")}</TableHead>
              <TableHead className="text-center border-r">{t('packUn')}</TableHead>
              <TableHead className="text-center border-l">{t('units')}</TableHead>
              <TableHead className="text-center">{t("qtyInUn")}</TableHead>
              <TableHead className="text-center border-r">{t('packUn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.itemCode}</TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell className="text-center border-l">{formatNumber(row.openQuantity, 0)}</TableCell>
                <TableCell className="text-center">{formatNumber(row.openQuantity / row.numInBuy)}</TableCell>
                <TableCell className="text-center border-r">{formatNumber(row.openQuantity / row.numInBuy / row.purPackUn)}</TableCell>
                <TableCell className="text-center border-l">{formatNumber(row.quantity, 0)}</TableCell>
                <TableCell className="text-center">{formatNumber(row.quantity / row.numInBuy)}</TableCell>
                <TableCell className="text-center border-r">{formatNumber(row.quantity / row.numInBuy / row.purPackUn)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default GoodsReceiptVSExitReportTable;
