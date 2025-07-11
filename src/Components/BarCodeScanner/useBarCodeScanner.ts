import {useState, useRef, useEffect} from 'react';
import {toast} from 'sonner';
import {useTranslation} from 'react-i18next';
import {useThemeContext} from '@/components';
import {distinctItems, StringFormat, UnitType} from '@/assets';
import {getPackageByBarcode} from '@/features/packages/hooks';
import {ObjectType, PackageMovementType} from '@/features/packages/types';
import {AddItemValue, PackageValue} from './types';
import {Item} from "@/features/items/data/items";
import {itemsService} from "@/features/items/data/items-service";

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
  onPackageChanged?: (value: PackageValue) => void;
  binEntry?: number | undefined;
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
                                    onPackageChanged,
                                    binEntry,
                                  }: UseBarCodeScannerProps) => {
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<UnitType>(UnitType.Pack);
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
        const message = !item ? t("barnameRequired") : t("scannameRequired");
        toast.warning(message);
        return;
      }

      setLoading(true);
      itemsService.scanBarcode(barcode, item)
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

  const handleItems = (items: Item[]) => {
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
      item.barcode = barcode;
      barcodeRef?.current?.blur();
      onAddItem({
        item: items[0],
        unit: selectedUnit,
        createPackage: createPackage,
        package: loadedPackage,
      });
      return;
    }
    handleMultipleItems(items);
  };

  const handleMultipleItems = (items: Item[]) => {
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
        const checkCreationObject = response.locationHistory?.find(
          (v) => v.sourceOperationType === objectType &&
            v.sourceOperationId === objectId &&
            v.movementType === PackageMovementType.Created
        );
        if (!checkCreationObject) {
          toast.error(t('scanPackageSourceDoc', {barcode, number: objectNumber}));
          return;
        }
        const value: PackageValue = {id: response.id, barcode: response.barcode};
        setLoadedPackage(value);
        setScanMode('item');
        onPackageChanged?.(value);
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