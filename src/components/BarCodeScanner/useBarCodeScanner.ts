import {useRef, useState} from 'react';
import {toast} from 'sonner';
import {useTranslation} from 'react-i18next';
import {useAuth, useThemeContext} from '@/components';
import {ObjectType, UnitType} from '@/features/shared/data';
import {AddItemValue} from './types';
import {ItemInfoResponse} from "@/features/items/data/items";
import {itemsService} from "@/features/items/data/items-service";
import {StringFormat} from "@/utils/string-utils";
import {ScannerMode} from '@/features/login/data/login';

interface UseBarCodeScannerProps {
  enabled: boolean;
  item?: boolean;
  pickPackOnly?: boolean;
  objectType?: ObjectType;
  onAddItem: (addItem: AddItemValue) => void;
}

export const useBarCodeScanner = ({
                                    enabled,
                                    item,
                                    objectType,
                                    onAddItem,
                                  }: UseBarCodeScannerProps) => {
  const {user, getUnitSettings: getUnitSettingsFn} = useAuth();
  const unitSettings = getUnitSettingsFn(objectType);
  const defaultUnit = unitSettings.defaultUnitType;
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<UnitType>(defaultUnit);
  const [isProcessing, setIsProcessing] = useState(false);

  const {setError} = useThemeContext();
  const {t} = useTranslation();

  const clearBarCode = () => {
    setBarcodeInput('');
    setSelectedUnit(defaultUnit);
  };

  const handleScanBarcode = (barcode: string) => {
    try {
      if (barcode.length === 0) {
        const message = item ? t("scanCodeRequired") :
          user!.settings.scannerMode === ScannerMode.ItemBarcode ?
            t("barCodeRequired") : t("scanCodeRequired");
        toast.warning(message);
        return;
      }

      setIsProcessing(true);
      itemsService.scanBarcode(barcode, item || user!.settings.scannerMode === ScannerMode.ItemCode)
        .then((items) => handleItems(items))
        .catch((error) => {
          setError(error);
          setIsProcessing(false);
        });
    } catch (e) {
      setError(e);
      setIsProcessing(false);
    }
  };

  const handleItems = (items: ItemInfoResponse[]) => {
    const barcode = barcodeInput;
    if (items.length === 0) {
      const template = !item ? t("barcodeNotFound") : t("codeNotFound");
      setError(StringFormat(template, barcode));
      clearBarCode();
      setIsProcessing(false);
      return;
    }
    if (items.length === 1) {
      const scannedItem = items[0];
      if (user!.settings.scannerMode === ScannerMode.ItemBarcode) {
        scannedItem.barcode = barcode;
      }
      barcodeRef?.current?.blur();
      onAddItem({
        item: scannedItem,
        unit: selectedUnit,
      });
      setIsProcessing(false);
      return;
    }
    handleMultipleItems(items);
  };

  function distinctItems(items: ItemInfoResponse[]): string[] {
    return items
      .map(item => item.father ?? item.code)
      .filter((code, index, array) => array.indexOf(code) === index);
  }

  const handleMultipleItems = (items: ItemInfoResponse[]) => {
    const distinctCodes = distinctItems(items);
    if (distinctCodes.length !== 1) {
      const codes = distinctCodes.map((v) => `"${v}"`).join(", ");
      setError(StringFormat(t("multipleItemsError"), codes));
      setIsProcessing(false);
      return;
    }
    window.alert(t('multipleBoxesNotImplemented'));
    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanBarcode(barcodeInput);
  };

  const handleUnitChanged = (value: string) => {
    const unit = value as UnitType;
    setSelectedUnit(unit);
    barcodeRef?.current?.focus();
  };

  return {
    barcodeRef,
    barcodeInput,
    setBarcodeInput,
    selectedUnit,
    clearBarCode,
    handleSubmit,
    handleUnitChanged,
    enabled,
    isProcessing
  };
};
