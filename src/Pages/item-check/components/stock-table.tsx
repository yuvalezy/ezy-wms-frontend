import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {ItemCheckResponse, itemStock, ItemStockResponse} from "../item-check";
import {useThemeContext} from "@/components/ThemeContext";
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components";
import {useStockInfo} from "@/utils/stock-info";
import {ChevronDown, ChevronRight, Package} from "lucide-react";
import {Button} from "@/components/ui/button";

interface StockTableProps {
  result: ItemCheckResponse
}

const StockTable: React.FC<StockTableProps> = ({result}) => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const stockInfo = useStockInfo();
  const [data, setData] = useState<ItemStockResponse[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (result && result.itemCode) {
      setLoading(true);
      itemStock(result.itemCode)
        .then((data) => setData(data))
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
    }
  }, [result]);

  const toggleRow = (binEntry: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(binEntry)) {
      newExpanded.delete(binEntry);
    } else {
      newExpanded.add(binEntry);
    }
    setExpandedRows(newExpanded);
  };

  if (!result) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('bin')}</TableHead>
          <TableHead>{t('stock')}</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      {data.length > 0 && (
        <TableBody>
          {data.map((binStock, index) => {
            const hasPackages = binStock.packages && binStock.packages.length > 0;
            const isExpanded = expandedRows.has(binStock.binEntry);

            return (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell>{binStock.binCode}</TableCell>
                  <TableCell>
                    {stockInfo({
                      quantity: binStock.quantity,
                      numInBuy: result.numInBuy,
                      buyUnitMsr: result.buyUnitMsr,
                      purPackUn: result.purPackUn,
                      purPackMsr: result.purPackMsr,
                    })}
                  </TableCell>
                  <TableCell>
                    {hasPackages && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(binStock.binEntry)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {hasPackages && isExpanded && (
                  <TableRow>
                    <TableCell colSpan={3} className="bg-gray-50 p-0">
                      <div className="px-4 py-2">
                        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                          <Package className="h-4 w-4" />
                          {t('packages')}
                        </div>
                        <div className="space-y-1">
                          {binStock.packages!.map((pkg, pkgIndex) => (
                            <div key={pkgIndex} className="flex justify-between items-center py-1 px-2 bg-white rounded text-sm">
                              <span className="font-medium">{pkg.barcode}</span>
                              <span className="text-gray-600">
                                {stockInfo({
                                  quantity: pkg.quantity,
                                  numInBuy: result.numInBuy,
                                  buyUnitMsr: result.buyUnitMsr,
                                  purPackUn: result.purPackUn,
                                  purPackMsr: result.purPackMsr,
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      )}
      {data.length === 0 && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>{t('noStockDataFound')}</TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  )
};
export default StockTable;
