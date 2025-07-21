import React, {useEffect, useState, useRef} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import ContentTheme from '@/components/ContentTheme';
import BarCodeScanner, {PackageValue} from '@/components/BarCodeScanner';
import {useThemeContext} from '@/components/ThemeContext';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Check, AlertCircle} from 'lucide-react';
import {pickingService} from '@/features/picking/data/picking-service';
import {PickListCheckSummaryResponse, PickingDocument, PickListCheckItemDetail} from '@/features/picking/data/picking';
import {UnitType} from '@/features/shared/data';
import {formatNumber} from '@/utils/number-utils';
import {AddItemValue} from '@/components/BarCodeScanner/types';
import {useStockInfo} from "@/utils/stock-info";
import {diff} from "node:util";
import {useAuth} from "@/components";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";

export default function PickingCheck() {
  const {id} = useParams<{ id: string }>();
  const {t} = useTranslation();
  const {user} = useAuth();
  const navigate = useNavigate();
  const {setLoading, setError} = useThemeContext();
  const barcodeRef = useRef<any>(null);

  const [pickList, setPickList] = useState<PickingDocument | null>(null);
  const [checkSummary, setCheckSummary] = useState<PickListCheckSummaryResponse | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const stockInfo = useStockInfo();

  useEffect(() => {
    if (id) {
      loadPickList();
      loadCheckSummary();
    }
  }, [id]);

  const loadPickList = async () => {
    setLoading(true);
    try {
      const data = await pickingService.fetchPicking({id: parseInt(id!)});
      setPickList(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCheckSummary = async () => {
    try {
      const summary = await pickingService.getCheckSummary(parseInt(id!));
      setCheckSummary(summary);
    } catch (error) {
      console.error('Error loading check summary:', error);
    }
  };

  const handleAddItem = async (value: AddItemValue) => {
    try {
      const response = await pickingService.checkItem(parseInt(id!), {
        itemCode: value.item.code,
        checkedQuantity: 1, // Default to 1, quantity is typically handled separately in BarCodeScanner
        unit: value.unit,
        binEntry: undefined
      });

      if (response.success) {
        await loadCheckSummary();
        barcodeRef.current?.clear();
      } else {
        setError(new Error(response.errorMessage || 'Failed to check item'));
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false)
    }
  };

  const handleAddPackage = async (value: PackageValue) => {
    try {
      const response = await pickingService.checkPackage(parseInt(id!), value.id);

      if (response.success) {
        await loadCheckSummary();
        barcodeRef.current?.clear();
      } else {
        setError(new Error(response.errorMessage || 'Failed to check package'));
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteCheck = async () => {
    setIsCompleting(true);
    try {
      await pickingService.completeCheck(parseInt(id!));
      navigate('/pickSupervisor');
    } catch (error) {
      setError(error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getRowStyle = (difference: number) => {
    if (difference === 0) return 'bg-green-50';
    return 'bg-red-50';
  };

  const getDifferenceDisplay = (item: PickListCheckItemDetail) => {
    const difference = item.difference;
    if (difference === 0) {
      return <Check className="h-4 w-4 text-green-600"/>;
    }
    return (
      <div className="flex items-center gap-1">
        <AlertCircle className="h-4 w-4 text-red-600"/>
        <span className={`font-bold ${difference > 0 ? 'text-red-600' : 'text-orange-600'}`}>
          {difference > 0 ? '+' : ''}
          {stockInfo({
            quantity: difference,
            numInBuy: item.quantityInUnit,
            buyUnitMsr: item.unitMeasure,
            purPackUn: item.quantityInPack,
            purPackMsr: item.packMeasure,
          })}
        </span>
      </div>
    );
  };

  return (
    <ContentTheme
      title={t('pickingCheck')}
      titleOnClick={() => navigate('/pick')}
      titleBreadcrumbs={[{label: `#${id}`}]}
      footer={
        pickList?.checkStarted && <BarCodeScanner
          ref={barcodeRef}
          enabled
          unit
          onAddItem={handleAddItem}
          onAddPackage={handleAddPackage}
        />
      }
    >
      {checkSummary && (
        <>
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">{t('startedBy')}</p>
                <p className="font-semibold">{checkSummary.checkStartedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('progress')}</p>
                <p className="font-semibold">
                  {checkSummary.itemsChecked} / {checkSummary.totalItems}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('discrepancies')}</p>
                <p className="font-semibold">
                  <Badge variant={checkSummary.discrepancyCount > 0 ? 'destructive' : 'default'}>
                    {checkSummary.discrepancyCount}
                  </Badge>
                </p>
              </div>
              {(user?.superUser || user?.roles?.includes(RoleType.PICKING_SUPERVISOR)) && pickList?.checkStarted &&
              <div className="flex items-end">
                <Button
                  onClick={handleCompleteCheck}
                  disabled={isCompleting || checkSummary.itemsChecked === 0}
                  className="w-full"
                >
                  {t('completeCheck')}
                </Button>
              </div>
              }
            </div>
          </div>

          {checkSummary.discrepancyCount > 0 && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4"/>
              <AlertDescription>
                {t('checkDiscrepanciesFound', {count: checkSummary.discrepancyCount})}
              </AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('item')}</TableHead>
                <TableHead>{t('description')}</TableHead>
                <TableHead>{t('picked')}</TableHead>
                <TableHead>{t('checked')}</TableHead>
                <TableHead>{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkSummary.items.map((item) => (
                <TableRow key={item.itemCode} className={getRowStyle(item.difference)}>
                  <TableCell className="font-medium">{item.itemCode}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{stockInfo({
                    quantity: item.pickedQuantity,
                    numInBuy: item.quantityInUnit,
                    buyUnitMsr: item.unitMeasure,
                    purPackUn: item.quantityInPack,
                    purPackMsr: item.packMeasure,
                  })}</TableCell>
                  <TableCell>
                    {item.checkedQuantity > 0 ? stockInfo({
                      quantity: item.checkedQuantity,
                      numInBuy: item.quantityInUnit,
                      buyUnitMsr: item.unitMeasure,
                      purPackUn: item.quantityInPack,
                      purPackMsr: item.packMeasure,
                    }) : '-'}
                  </TableCell>
                  <TableCell>
                    {item.checkedQuantity > 0 ? getDifferenceDisplay(item) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </ContentTheme>
  );
}