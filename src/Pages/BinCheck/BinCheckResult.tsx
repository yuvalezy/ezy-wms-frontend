import React, {useEffect, useState} from "react";
import {BinContentResponse} from "./Bins";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";

export const BinCheckResult: React.FC<{ content: BinContentResponse[] }> = ({content}) => {
  const {t} = useTranslation();
  const [data, setData] = useState<BinContentResponse[]>([]);
  const stockInfo = useStockInfo();

  useEffect(() => {
    if (content) {
      setData(content);
    }
  }, [content]);

  if (!content || content.length === 0) {
    return <p className="text-center text-muted-foreground">{t('noBinContentFound')}</p>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('item')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('description')}</TableHead>
            <TableHead>{t('stock')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((binContent, index) => {
            return (
              <>
                <TableRow key={index}>
                  <TableCell className="font-medium">{binContent.itemCode}</TableCell>
                  <TableCell className="hidden sm:table-cell">{binContent.itemName}</TableCell>
                  <TableCell>
                    {stockInfo({
                      quantity: binContent.onHand,
                      numInBuy: binContent.numInBuy,
                      buyUnitMsr: binContent.buyUnitMsr,
                      purPackUn: binContent.purPackUn,
                      purPackMsr: binContent.purPackMsr,
                    })}
                  </TableCell>
                </TableRow>
                <TableRow className="sm:hidden">
                  <TableCell className="bg-gray-100 border-b-1"
                              colSpan={2}>{t('description')}: {binContent.itemName}</TableCell>
                </TableRow>
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
