import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {PickingDocumentDetailItem} from "@/pages/picking/data/picking-document";
import BinLocationQuantities from "../../../components/BinLocationQuantities";
import {InfoBoxValue, MetricRow, SecondaryInfoBox} from "@/components";
import {formatNumber} from "@/lib/utils";
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

  useEffect(() => {
    console.log(items);
    console.log(available);
  }, [available]);

  return (
    <div className="contentStyle">
      {/*/!* Mobile view - Cards *!/*/}
      {/*<div className="block sm:hidden">*/}
      {/*  {items?.map((row) => (*/}
      {/*    <Card key={row.itemCode} className={`mb-4 ${row.openQuantity === 0 ? 'bg-green-100' : ''}`}>*/}
      {/*      <CardHeader>*/}
      {/*        <CardTitle>{row.itemCode} - {row.itemName}</CardTitle>*/}
      {/*      </CardHeader>*/}
      {/*      <CardContent>*/}
      {/*        {!available ? <>*/}
      {/*          <SecondaryInfoBox>*/}
      {/*            <InfoBoxValue label={t('quantity')} value={row.quantity}/>*/}
      {/*            <InfoBoxValue label={t('picked')} value={row.picked}/>*/}
      {/*            <InfoBoxValue label={t('pending')} value={row.openQuantity}/>*/}
      {/*            <InfoBoxValue label={t('qtyInUn')} value={row.numInBuy.toString()}/>*/}
      {/*            <InfoBoxValue label={t('qtyInPack')} value={row.purPackUn.toString()}/>*/}
      {/*          </SecondaryInfoBox>*/}
      {/*          {row.openQuantity > 0 && row.binQuantities && row.binQuantities.length > 0 && (*/}
      {/*            <div className="mt-4 bg-slate-50 rounded-md">*/}
      {/*              <BinLocationQuantities data={row}/>*/}
      {/*            </div>*/}
      {/*          )}*/}
      {/*        </> : <>*/}
      {/*          <SecondaryInfoBox>*/}
      {/*            <InfoBoxValue label={t('qtyInUn')} value={row.numInBuy.toString()}/>*/}
      {/*            <InfoBoxValue label={t('qtyInPack')} value={row.purPackUn.toString()}/>*/}
      {/*          </SecondaryInfoBox>*/}
      {/*          <div className="flex justify-between items-center border-b-2 border-primary font-bold">*/}
      {/*            <div className="w-[30%]">*/}
      {/*              <span>{t('bin')}</span>*/}
      {/*            </div>*/}
      {/*            <div className="flex-1 flex justify-around text-center">*/}
      {/*              <div className="flex-1 text-xs">*/}
      {/*                <span>{t('units')}</span>*/}
      {/*              </div>*/}
      {/*              <div className="flex-1 text-xs">*/}
      {/*                <span>{t('dozens')}</span>*/}
      {/*              </div>*/}
      {/*              <div className="flex-1 text-xs">*/}
      {/*                <span>{t('boxes')}</span>*/}
      {/*              </div>*/}
      {/*            </div>*/}
      {/*          </div>*/}
      {/*          <MetricRow*/}
      {/*            label={t('quantity')}*/}
      {/*            values={{*/}
      {/*              units: formatNumber(row.quantity, 0),*/}
      {/*              buyUnits: formatNumber(row.quantity / row.numInBuy, 2),*/}
      {/*              packUnits: formatNumber(row.quantity / row.numInBuy / row.purPackUn, 2)*/}
      {/*            }}*/}
      {/*          />*/}
      {/*          <MetricRow*/}
      {/*            label={t('picked')}*/}
      {/*            values={{*/}
      {/*              units: formatNumber(row.picked, 0),*/}
      {/*              buyUnits: formatNumber(row.picked / row.numInBuy, 2),*/}
      {/*              packUnits: formatNumber(row.picked / row.numInBuy / row.purPackUn, 2)*/}
      {/*            }}*/}
      {/*          />*/}
      {/*          <MetricRow*/}
      {/*            label={t('pending')}*/}
      {/*            values={{*/}
      {/*              units: formatNumber(row.openQuantity, 0),*/}
      {/*              buyUnits: formatNumber(row.openQuantity / row.numInBuy, 2),*/}
      {/*              packUnits: formatNumber(row.openQuantity / row.numInBuy / row.purPackUn, 2)*/}
      {/*            }}*/}
      {/*          />*/}
      {/*          <MetricRow*/}
      {/*            label={t('available')}*/}
      {/*            values={{*/}
      {/*              units: formatNumber(row.available ?? 0, 0),*/}
      {/*              buyUnits: formatNumber((row.available ?? 0) / row.numInBuy, 2),*/}
      {/*              packUnits: formatNumber((row.available ?? 0) / row.numInBuy / row.purPackUn, 2)*/}
      {/*            }}*/}
      {/*          />*/}
      {/*        </>}*/}
      {/*      </CardContent>*/}
      {/*    </Card>*/}
      {/*  ))}*/}
      {/*</div>*/}

      {/* Desktop view - Table */}
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
                      quantity: row.available,
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
