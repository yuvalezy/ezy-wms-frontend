import * as React from 'react';
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";
import {FullInfoBox, InfoBoxValue} from "@/components/InfoBox";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {CountingSummaryReportLine} from "@/features/counting/data/counting";
import {Status} from "@/features/shared/data";
import {Button} from "@/components/ui/button";

interface CountingSummaryReportTableProps {
  data: CountingSummaryReportLine[]
  onClick?: (data: CountingSummaryReportLine) => void
  status?: Status
}

const CountingSummaryReportTable: React.FC<CountingSummaryReportTableProps> = ({data, onClick, status}) => {
  const {t} = useTranslation();
  const stockInfo = useStockInfo();

  const allowModify = status === Status.Open || status === Status.InProgress;

  return (
    <>
      {/* Mobile view - Cards */}
      <div className="sm:hidden flex flex-col gap-4">
        {data.map((row) => (
          <FullInfoBox key={`${row.itemCode}-${row.binCode}`}>
            <InfoBoxValue label={t('bin')} value={row.binCode}/>
            <InfoBoxValue label={t('code')} value={row.itemCode} itemDetailsLink={row}/>
            <InfoBoxValue label={t('description')} value={row.itemName}/>
            <InfoBoxValue label={t('quantity')} value={stockInfo({
              quantity: row.quantity,
              numInBuy: row.numInBuy,
              buyUnitMsr: row.buyUnitMsr || "",
              purPackUn: row.purPackUn,
              purPackMsr: row.purPackMsr || "",
            })}/>
            {allowModify && onClick && (
              <div className="pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onClick(row)}
                >
                  {t('modifyValues')}
                </Button>
              </div>
            )}
          </FullInfoBox>
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
              {allowModify && <TableHead className="border-l"></TableHead>}
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
                {allowModify && onClick && (
                  <TableCell className="border-l">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onClick(row)}
                    >
                      {t('modifyValues')}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default CountingSummaryReportTable;
