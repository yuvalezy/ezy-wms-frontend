import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import React from "react";
import {useTranslation} from "react-i18next";
import {PickingDocumentDetailItem} from "@/features/picking/data/picking";
import {useStockInfo} from "@/utils/stock-info";

interface PickingProcessDetailContentAvailableProps {
  items?: PickingDocumentDetailItem[] | undefined
}

export const PickingProcessDetailContentAvailable = ({items}: PickingProcessDetailContentAvailableProps) => {
  const {t} = useTranslation();
  const stockInfo = useStockInfo();
  return <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{t('code')}</TableHead>
        <TableHead className="hidden sm:table-cell">{t('description')}</TableHead>
        <TableHead>{t('quantity')}</TableHead>
        <TableHead>{t('picked')}</TableHead>
        <TableHead>{t('pending')}</TableHead>
        <TableHead>{t('available')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items?.map((row) => (
        <>
          <TableRow key={row.itemCode} className={row.openQuantity === 0 ? 'bg-green-100' : ''}>
            <TableCell>
              <ItemDetailsLink data={row}/>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{row.itemName}</TableCell>
            <TableCell>
              {stockInfo({
                quantity: row.quantity,
                numInBuy: row.numInBuy,
                buyUnitMsr: row.buyUnitMsr,
                purPackUn: row.purPackUn,
                purPackMsr: row.purPackMsr,
              })}
            </TableCell>
            <TableCell>
              {stockInfo({
                quantity: row.picked,
                numInBuy: row.numInBuy,
                buyUnitMsr: row.buyUnitMsr,
                purPackUn: row.purPackUn,
                purPackMsr: row.purPackMsr,
              })}
            </TableCell>
            <TableCell>
              {stockInfo({
                quantity: row.openQuantity,
                numInBuy: row.numInBuy,
                buyUnitMsr: row.buyUnitMsr,
                purPackUn: row.purPackUn,
                purPackMsr: row.purPackMsr,
              })}
            </TableCell>
            <TableCell>
              {stockInfo({
                quantity: row.available ?? 0,
                numInBuy: row.numInBuy,
                buyUnitMsr: row.buyUnitMsr,
                purPackUn: row.purPackUn,
                purPackMsr: row.purPackMsr,
              })}
            </TableCell>
          </TableRow>
          <TableRow className="sm:hidden">
            <TableCell className="bg-gray-100 border-b-1"
                       colSpan={6}>{t('description')}: {row.itemName}</TableCell>
          </TableRow>
          {row.packages?.map((p, packIndex) => {
            return <TableRow key={`${row.itemCode}-pack${packIndex}`} className={`${row.openQuantity === 0 ? 'bg-green-100' : ''} ${p.fullPackage ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
              <TableCell colSpan={2}>
                {p.fullPackage && '📦 '}{p.barcode}
              </TableCell>
              <TableCell>
                &nbsp;
              </TableCell>
              <TableCell>
                {stockInfo({
                  quantity: 0, //todo apply picked
                  numInBuy: row.numInBuy,
                  buyUnitMsr: row.buyUnitMsr,
                  purPackUn: row.purPackUn,
                  purPackMsr: row.purPackMsr,
                })}
              </TableCell>
              <TableCell>
                {stockInfo({
                  quantity: p.quantity, //todo apply available
                  numInBuy: row.numInBuy,
                  buyUnitMsr: row.buyUnitMsr,
                  purPackUn: row.purPackUn,
                  purPackMsr: row.purPackMsr,
                })}
              </TableCell>
              <TableCell>
                {stockInfo({
                  quantity: p.quantity, //todo apply available
                  numInBuy: row.numInBuy,
                  buyUnitMsr: row.buyUnitMsr,
                  purPackUn: row.purPackUn,
                  purPackMsr: row.purPackMsr,
                })}
              </TableCell>
            </TableRow>
          })}
        </>
      ))}
    </TableBody>
  </Table>

}