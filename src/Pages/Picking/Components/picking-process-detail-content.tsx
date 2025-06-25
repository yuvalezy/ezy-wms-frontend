import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {PickingDocumentDetailItem} from "@/pages/picking/data/picking-document";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";
import {useItemDetailsPopup} from "@/hooks/useItemDetailsPopup";
import {Link} from "react-router-dom";

export interface PickingProcessDetailContentProps {
  items?: PickingDocumentDetailItem[];
}

export const PickingProcessDetailContent: React.FC<PickingProcessDetailContentProps> = ({items}) => {
  const {t} = useTranslation();
  const [available, setAvailable] = useState(false);
  const stockInfo = useStockInfo();
  const {openItemDetails} = useItemDetailsPopup();

  useEffect(() => {
    setAvailable(items?.some(i => i.available != null && i.available > 0) ?? false);
  }, [items]);

  const showDetails = (row: PickingDocumentDetailItem) => {
    openItemDetails({
      itemCode: row.itemCode,
      itemName: row.itemName,
      numInBuy: row.numInBuy,
      buyUnitMsr: row.buyUnitMsr,
      purPackUn: row.purPackUn,
      purPackMsr: row.purPackMsr
    });
  }

  return (
    <div className="contentStyle">
      {!available ? (
        <Table>
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
            {items?.map((row) => (
              <React.Fragment key={row.itemCode}>
                <TableRow className={row.openQuantity === 0 ? 'bg-green-100' : ''}>
                  <TableCell><Link
                    className="text-blue-600 hover:underline"
                    onClick={() => showDetails(row)} to={""}>{row.itemCode}</Link></TableCell>
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
                             colSpan={4}>{t('description')}: {row.itemName}</TableCell>
                </TableRow>
                {row.openQuantity > 0 && row.binQuantities && row.binQuantities.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <div className="bg-slate-50 p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('bin')}</TableHead>
                              <TableHead>{t('quantity')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {row.binQuantities.map((bin) => (
                              <TableRow key={bin.code}>
                                <TableCell>{bin.code}</TableCell>
                                <TableCell>{stockInfo({
                                  quantity: bin.quantity,
                                  numInBuy: row.numInBuy,
                                  buyUnitMsr: row.buyUnitMsr,
                                  purPackUn: row.purPackUn,
                                  purPackMsr: row.purPackMsr,
                                })}</TableCell>
                              </TableRow>
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
      ) : (
        <Table>
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
                  <TableCell><Link
                    className="text-blue-600 hover:underline"
                    onClick={() => showDetails(row)} to={""}>{row.itemCode}</Link></TableCell>
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
                      quantity: row.available??0,
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
              </>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default PickingProcessDetailContent;
