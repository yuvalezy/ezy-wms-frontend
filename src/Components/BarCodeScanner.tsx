import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faQrcode} from '@fortawesome/free-solid-svg-icons';
import {IconProp} from '@fortawesome/fontawesome-svg-core'; // Import IconProp
import {scanBarcode} from "@/assets";
import {StringFormat, distinctItems, Item, UnitType} from "@/assets";
import {useThemeContext} from "./ThemeContext";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {Switch} from "@/components/ui/switch";
import {Checkbox} from "@/components/ui/checkbox";

export interface PackageValue {
  id: string;
  barcode: string;
}

export interface AddItemValue {
  item: Item;
  unit: UnitType;
  createPackage: boolean;
  package?: PackageValue;
}

export interface BarCodeScannerProps {
  enabled: boolean;
  unit?: boolean;
  item?: boolean;
  onAddItem: (addItem: AddItemValue) => void;
  onAddAction?: () => void;
  addActionLabel?: string;
  addActionIcon?: IconProp;
  pickPackOnly?: boolean;
  enablePackage?: boolean;
  currentPackage?: PackageValue | null;
}

export interface BarCodeScannerRef {
  clear: () => void;
  focus: () => void;
  getValue: () => string;
}

const BarCodeScanner = forwardRef<BarCodeScannerRef, BarCodeScannerProps>((
  {
    enabled,
    unit = false,
    item,
    onAddItem,
    onAddAction,
    addActionLabel,
    addActionIcon,
    pickPackOnly = false,
    enablePackage = false,
    currentPackage
  }, ref) => {
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const {setLoading, setError} = useThemeContext();
  const [selectedUnit, setSelectedUnit] = useState<UnitType>(UnitType.Pack);
  const [scanMode, setScanMode] = useState<'item' | 'package'>('item');
  const [createPackage, setCreatePackage] = useState(false);
  const {t} = useTranslation();

  useImperativeHandle(ref, () => ({
    clear() {
      clearBarCode();
    },
    focus() {
      barcodeRef?.current?.focus();
    },
    getValue() {
      return barcodeInput;
    }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (scanMode === 'package') {
      handleScanPackage(barcodeInput);
    } else {
      handleScanBarcode(barcodeInput);
    }
  };

  function handleScanBarcode(barcode: string) {
    try {
      if (barcode.length === 0) {
        let message = !item ? t("barnameRequired") : t("scannameRequired");
        toast.warning(message);
        return;
      }

      setLoading(true);
      scanBarcode(barcode, item)
        .then((items) => handleItems(items))
        .catch((error) => {
          setError(error);
          setLoading(false);
        });
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }

  const clearBarCode = () => {
    setBarcodeInput('');
    setSelectedUnit(UnitType.Pack);
    setCreatePackage(false);
  }

  function handleItems(items: Item[]) {
    let barcode = barcodeInput;
    if (items.length === 0) {
      let template = !item ? t("barcodeNotFound") : t("codeNotFound");
      setError(StringFormat(template, barcode));
      clearBarCode();
      setLoading(false);
      return;
    }
    if (items.length === 1) {
      let item = items[0];
      item.barcode = barcode;
      barcodeRef?.current?.blur();
      onAddItem({
        item: items[0],
        unit: selectedUnit,
        createPackage: createPackage,
        package: currentPackage,
      });
      return;
    }
    handleMultipleItems(items);
  }

  function handleMultipleItems(items: Item[]) {
    const distinctCodes = distinctItems(items);
    if (distinctCodes.length !== 1) {
      let codes = distinctCodes.map((v) => `"${v}"`).join(", ");
      setError(StringFormat(t("multipleItemsError"), codes));
      setLoading(false);
      return;
    }
    window.alert('Multiple Boxes not implemented yet');
    setLoading(false);
  }

  const barcodeLabel = !item ? t("barcode") : t("code");

  const units = [
    {text: t("unit"), value: UnitType.Unit},
    {text: t("dozen"), value: UnitType.Dozen},
    {text: t("box"), value: UnitType.Pack}
  ];

  const handleUnitChanged = (value: string) => {
    const selected = units.find((unit) => unit.value.toString() === value);
    if (selected) {
      setSelectedUnit(selected.value);
    }
    barcodeRef?.current?.focus();
  }

  const handleScanPackage = (barcode: string) => {
    if (barcode.length === 0) {
      toast.warning(t("barcodeRequired"));
      return;
    }

    window.alert('not implemented yet');
    return;
    // onAddItem({
    //   item: {} as Item,
    //   unit: selectedUnit,
    //   createPackage: false,
    //   packageId: barcode
    // });
    clearBarCode();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
      {currentPackage && <div className="space-y-2">
        <Label htmlFor="barcode-input">Current Package</Label>
        <Input
          id="current-package"
          value={currentPackage.barcode}
          readOnly
        />
      </div>}
      <div className="space-y-2">
        <Label htmlFor="barcode-input">{barcodeLabel}</Label>
        <Input
          id="barcode-input"
          required
          value={barcodeInput}
          ref={barcodeRef}
          onChange={(e) => setBarcodeInput(e.target.value)}
          disabled={!enabled}
        />
      </div>
      {unit && scanMode === 'item' && (
        <div className="space-y-2">
          <Label htmlFor="unit-select">{t('unit')}</Label>
          <Select disabled={pickPackOnly} onValueChange={handleUnitChanged} value={selectedUnit.toString()}>
            <SelectTrigger id="unit-select">
              <SelectValue placeholder={t('selectUnit')}/>
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.value} value={unit.value.toString()}>
                  {unit.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {enablePackage && (
        <div className="space-y-2">
          {scanMode === 'item' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-package"
                checked={createPackage}
                onCheckedChange={v => setCreatePackage(!createPackage)}
              />
              <Label htmlFor="create-package">Create new package</Label>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="scan-mode"
              checked={scanMode === 'package'}
              onCheckedChange={(checked) => {
                setScanMode(checked ? 'package' : 'item');
                setTimeout(() => barcodeRef?.current?.focus(), 1);
              }}
            />
            <Label htmlFor="scan-mode">
              {scanMode === 'package' ? 'Scan Package Mode' : 'Scan Item Mode'}
            </Label>
          </div>
        </div>
      )}
      <div className="flex space-x-2">
        {onAddAction == null && (
          <Button type="submit" disabled={!enabled} className="w-full">
            <FontAwesomeIcon icon={faCheck} className="mr-2"/>
            {scanMode === 'package' ? 'Scan Package' : 'Accept'}
          </Button>
        )}
        {onAddAction && (
          <>
            <Button type="submit" disabled={!enabled} className="flex-1">
              <FontAwesomeIcon icon={faCheck} className="mr-2"/>
              {scanMode === 'package' ? 'Scan Package' : 'Accept'}
            </Button>
            <Button variant="secondary" onClick={onAddAction} className="flex-1">
              {addActionIcon && <FontAwesomeIcon icon={addActionIcon} className="mr-2"/>}
              {addActionLabel}
            </Button>
          </>
        )}
      </div>
    </form>
  );
});

export default BarCodeScanner;
