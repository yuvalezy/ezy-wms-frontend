import * as React from 'react';
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";
import {FullInfoBox, InfoBoxValue} from "@/components/InfoBox";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {TransferContentBin, TransferSummaryReportLine} from "@/features/transfer/data/transfer";

// Quantities are decimal; an exact `!== 0` would light up the pending column for a rounding crumb.
const QUANTITY_EPSILON = 0.0001;

interface TransferSummaryReportTableProps {
  data: TransferSummaryReportLine[]
  emptyMessage?: string
}

const TransferSummaryReportTable: React.FC<TransferSummaryReportTableProps> = ({data, emptyMessage}) => {
  const {t} = useTranslation();
  const stockInfo = useStockInfo();

  const quantityOf = (row: TransferSummaryReportLine, quantity: number) => stockInfo({
    quantity,
    numInBuy: row.numInBuy,
    buyUnitMsr: row.buyUnitMsr ?? "",
    purPackUn: row.purPackUn,
    purPackMsr: row.purPackMsr ?? "",
  });

  const binList = (row: TransferSummaryReportLine, bins: TransferContentBin[]) => {
    if (bins.length === 0) {
      return <span className="text-muted-foreground">-</span>;
    }

    return (
      <div className="flex flex-col gap-0.5">
        {bins.map((bin) => (
          <span key={bin.entry} className="whitespace-nowrap">
            <span className="font-medium">{bin.code}</span>
            <span className="text-muted-foreground"> · {quantityOf(row, bin.quantity)}</span>
          </span>
        ))}
      </div>
    );
  };

  const pending = (row: TransferSummaryReportLine) => {
    const isPending = Math.abs(row.openQuantity) > QUANTITY_EPSILON;
    return (
      <span className={isPending ? "font-medium text-amber-600" : "text-muted-foreground"}>
        {quantityOf(row, row.openQuantity)}
      </span>
    );
  };

  return (
    <>
      {/* Mobile view - Cards */}
      <div className="sm:hidden flex flex-col gap-4">
        {data.map((row) => (
          <FullInfoBox key={row.itemCode}>
            <InfoBoxValue label={t('code')} value={row.itemCode} itemDetailsLink={row}/>
            <InfoBoxValue label={t('description')} value={row.itemName}/>
            <InfoBoxValue label={t('sourceBins')} value={binList(row, row.sourceBins)}/>
            <InfoBoxValue label={t('targetBins')} value={binList(row, row.targetBins)}/>
            <InfoBoxValue label={t('quantity')} value={quantityOf(row, row.sourceQuantity)}/>
            <InfoBoxValue label={t('placed')} value={quantityOf(row, row.targetQuantity)}/>
            <InfoBoxValue label={t('pending')} value={pending(row)}/>
          </FullInfoBox>
        ))}
        {data.length === 0 && emptyMessage && (
          <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
        )}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('code')}</TableHead>
              <TableHead>{t('description')}</TableHead>
              <TableHead>{t('sourceBins')}</TableHead>
              <TableHead>{t('targetBins')}</TableHead>
              <TableHead>{t('quantity')}</TableHead>
              <TableHead>{t('placed')}</TableHead>
              <TableHead>{t('pending')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.itemCode}>
                <TableCell>
                  <ItemDetailsLink data={row}/>
                </TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell>{binList(row, row.sourceBins)}</TableCell>
                <TableCell>{binList(row, row.targetBins)}</TableCell>
                <TableCell>{quantityOf(row, row.sourceQuantity)}</TableCell>
                <TableCell>{quantityOf(row, row.targetQuantity)}</TableCell>
                <TableCell>{pending(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          {data.length === 0 && emptyMessage && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </>
  );
}

export default TransferSummaryReportTable;
