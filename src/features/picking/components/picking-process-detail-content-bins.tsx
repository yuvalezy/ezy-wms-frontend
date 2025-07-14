import React from "react";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {PickingDocumentDetailItem} from "@/features/picking/data/picking";

interface PickingProcessDetailContentBinsProps {
  items?: PickingDocumentDetailItem[] | undefined
}

export const PickingProcessDetailContentBins = ({items}: PickingProcessDetailContentBinsProps) => {
  const stockInfo = useStockInfo();
  const {t} = useTranslation();
  return <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{t('code')}</TableHead>
        <TableHead className="hidden sm:table-cell">{t('description')}</TableHead>
        <TableHead>{t('quantity')}</TableHead>
        <TableHead>{t('picked')}</TableHead>
        <TableHead>{t('pending')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items?.map((row, itemIndex) => (
        <React.Fragment key={row.itemCode}>
          <TableRow className={row.openQuantity === 0 ? 'bg-green-100' : ''}>
            <TableCell><ItemDetailsLink data={row}/></TableCell>
            <TableCell className="hidden sm:table-cell">{row.itemName}</TableCell>
            <TableCell>{stockInfo({
              quantity: row.quantity,
              numInBuy: row.numInBuy,
              buyUnitMsr: row.buyUnitMsr,
              purPackUn: row.purPackUn,
              purPackMsr: row.purPackMsr,
            })}</TableCell>
            <TableCell>{stockInfo({
              quantity: row.picked,
              numInBuy: row.numInBuy,
              buyUnitMsr: row.buyUnitMsr,
              purPackUn: row.purPackUn,
              purPackMsr: row.purPackMsr,
            })}</TableCell>
            <TableCell>{stockInfo({
              quantity: row.openQuantity,
              numInBuy: row.numInBuy,
              buyUnitMsr: row.buyUnitMsr,
              purPackUn: row.purPackUn,
              purPackMsr: row.purPackMsr,
            })}</TableCell>
          </TableRow>
          <TableRow className="sm:hidden">
            <TableCell className="bg-gray-100 border-b-1"
                       colSpan={5}>{t('description')}: {row.itemName}</TableCell>
          </TableRow>
          {row.openQuantity > 0 && row.binQuantities && row.binQuantities.length > 0 && (
            <TableRow>
              <TableCell colSpan={5} className="p-0">
                <div className="bg-slate-50 p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('bin')}</TableHead>
                        <TableHead>{t('quantity')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {row.binQuantities.map((bin, binIndex) => (
                        <>
                          <TableRow key={`item${itemIndex}-bin${binIndex}`}>
                            <TableCell>{bin.code}</TableCell>
                            <TableCell>{stockInfo({
                              quantity: bin.quantity,
                              numInBuy: row.numInBuy,
                              buyUnitMsr: row.buyUnitMsr,
                              purPackUn: row.purPackUn,
                              purPackMsr: row.purPackMsr,
                            })}</TableCell>
                          </TableRow>
                          {bin.packages?.map((p, packIndex) =>
                            <TableRow className="bg-yellow-50" key={`item${itemIndex}-bin${binIndex}-pack${packIndex}`}>
                              <TableCell>📦{p.barcode}</TableCell>
                              <TableCell>{stockInfo({
                                quantity: p.quantity,
                                numInBuy: row.numInBuy,
                                buyUnitMsr: row.buyUnitMsr,
                                purPackUn: row.purPackUn,
                                purPackMsr: row.purPackMsr,
                              })}</TableCell>
                            </TableRow>)}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      ))}
    </TableBody>
  </Table>


}