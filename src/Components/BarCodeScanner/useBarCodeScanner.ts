import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import {useTranslation} from 'react-i18next';
import {useAuth, useThemeContext} from '@/components';
import {UnitType} from '@/features/shared/data';
import {getPackageByBarcode} from '@/features/packages/hooks';
import {ObjectType, PackageMovementType} from '@/features/packages/types';
import {AddItemValue, PackageValue} from './types';
import {ItemInfoResponse} from "@/features/items/data/items";
import {itemsService} from "@/features/items/data/items-service";
import {StringFormat} from "@/utils/string-utils";
import { ScannerMode } from '@/features/login/data/login';

interface UseBarCodeScannerProps {
  enabled: boolean;
  item?: boolean;
  pickPackOnly?: boolean;
  enablePackage?: boolean;
  currentPackage?: PackageValue | null;
  objectType?: ObjectType;
  objectId?: string;
  objectNumber?: number;
  onAddItem: (addItem: AddItemValue) => void;
  onAddPackage?: (value: PackageValue) => void;
  onPackageChanged?: (value: PackageValue) => void;
  binEntry?: number | undefined;
  isEphemeralPackage?: boolean;
}

export const useBarCodeScanner = ({
                                    enabled,
                                    item,
                                    enablePackage = false,
                                    currentPackage,
                                    objectType,
                                    objectId,
                                    objectNumber,
                                    onAddItem,
                                    onAddPackage,
                                    onPackageChanged,
                                    binEntry,
                                    isEphemeralPackage,
                                  }: UseBarCodeScannerProps) => {
  const {defaultUnit, user} = useAuth();
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<UnitType>(defaultUnit);
  const [scanMode, setScanMode] = useState<'item' | 'package'>('item');
  const [createPackage, setCreatePackage] = useState(false);
  const [loadedPackage, setLoadedPackage] = useState<PackageValue | null | undefined>(currentPackage);

  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();

  // Sync loadedPackage with currentPackage prop
  useEffect(() => {
    setLoadedPackage(currentPackage);
  }, [currentPackage]);

  const clearBarCode = () => {
    setBarcodeInput('');
    setSelectedUnit(UnitType.Pack);
    setCreatePackage(false);
  };

  const handleScanBarcode = (barcode: string) => {
    try {
      if (barcode.length === 0) {
        const message = item ? t("scanCodeRequired") :
          (user!.settings.scannerMode === ScannerMode.ItemBarcode || scanMode === 'package') ?
            t("barCodeRequired") : t("scanCodeRequired");
        toast.warning(message);
        return;
      }

      setLoading(true);
      itemsService.scanBarcode(barcode, item || user!.settings.scannerMode === ScannerMode.ItemCode)
        .then((items) => handleItems(items))
        .catch((error) => {
          setError(error);
          setLoading(false);
        });
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  };

  const handleItems = (items: ItemInfoResponse[]) => {
    const barcode = barcodeInput;
    if (items.length === 0) {
      const template = !item ? t("barcodeNotFound") : t("codeNotFound");
      setError(StringFormat(template, barcode));
      clearBarCode();
      setLoading(false);
      return;
    }
    if (items.length === 1) {
      const item = items[0];
      if (!item.isPackage) {
        if (user!.settings.scannerMode === ScannerMode.ItemBarcode) {
          item.barcode = barcode;
        }
        barcodeRef?.current?.blur();
        onAddItem({
          item: items[0],
          unit: selectedUnit,
          createPackage: createPackage,
          package: loadedPackage,
        });
      }
      else {
        if (onAddPackage != null) {
          onAddPackage({barcode, id: item.code});
        } else {
          setError('Add Package handler not implemented!');
        }
        barcodeRef?.current?.blur();
      }
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
      setLoading(false);
      return;
    }
    window.alert(t('multipleBoxesNotImplemented'));
    setLoading(false);
  };

  const handleScanPackage = (barcode: string) => {
    if (barcode.length === 0) {
      toast.warning(t("barcodeRequired"));
      return;
    }

    getPackageByBarcode({barcode, history: true, objectId, objectType, binEntry})
      .then((response) => {
        if (response == null) {
          toast.error(t('scanPackageNotFound', {barcode}));
          return;
        }
        if (objectType === ObjectType.GoodsReceipt) {
          const checkCreationObject = response.locationHistory?.find(
            (v) => v.sourceOperationType === objectType &&
              v.sourceOperationId === objectId &&
              v.movementType === PackageMovementType.Created
          );
          if (!checkCreationObject) {
            toast.error(t('scanPackageSourceDoc', {barcode, number: objectNumber}));
            return;
          }
        }
        const value: PackageValue = {id: response.id, barcode: response.barcode};
        if (isEphemeralPackage) {
          setLoadedPackage(value);
          setScanMode('item');
        }
        onPackageChanged?.(value);
        if (!isEphemeralPackage) {
          setTimeout(() => barcodeRef?.current?.focus(), 1);
        }
      })
      .catch((error) => {
        if (error.response?.data?.error === "Package is already counted in another bin location") {
          toast.error(t('packageAlreadyCounted'));
        } else if (error.response?.status === 404) {
          toast.error(t('packageNotFoundWithCode', {code: barcode}));
        } else {
          toast.error(error.message);
        }
      });
    clearBarCode();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scanMode === 'package') {
      handleScanPackage(barcodeInput);
    } else {
      handleScanBarcode(barcodeInput);
    }
  };

  const handleUnitChanged = (value: string) => {
    const unit = value as UnitType;
    setSelectedUnit(unit);
    barcodeRef?.current?.focus();
  };

  const handleScanModeChange = (checked: boolean) => {
    setScanMode(checked ? 'package' : 'item');
    setLoadedPackage(null);
    setTimeout(() => barcodeRef?.current?.focus(), 1);
  };

  const handleClearPackage = () => {
    setLoadedPackage(null);
  }

  return {
    barcodeRef,
    barcodeInput,
    setBarcodeInput,
    selectedUnit,
    scanMode,
    createPackage,
    setCreatePackage,
    loadedPackage,
    clearBarCode,
    handleSubmit,
    handleUnitChanged,
    handleScanModeChange,
    enabled,
    handleClearPackage
  };
};