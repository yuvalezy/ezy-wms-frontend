import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core'; // Import IconProp
import { MessageStripDesign } from "@ui5/webcomponents-react"; // Keep for MessageStripDesign enum
import {scanBarcode} from "../Assets/ScanBarcode";
import {distinctItems, Item, UnitType} from "../Assets/Common";
import {StringFormat} from "../Assets/Functions";
import {useThemeContext} from "./ThemeContext";
import {useTranslation} from "react-i18next";

export interface BarCodeScannerProps {
  enabled: boolean;
  unit?: boolean;
  item?: boolean;
  onAddItem: (item: Item, unit: UnitType) => void;
  onAddAction?: () => void;
  addActionLabel?: string;
  addActionIcon?: IconProp; // Update type to IconProp
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
    addActionIcon
  }, ref) => {
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const {setLoading, setAlert, setError} = useThemeContext();
  const [selectedUnit, setSelectedUnit] = useState<UnitType>(UnitType.Pack);
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
    handleScanBarcode(barcodeInput);
  };

  function handleScanBarcode(barcode: string) {
    try {
      if (barcode.length === 0) {
        let message = !item ? t("barcodeRequired") : t("scanCodeRequired");
        setAlert({message: message, type: MessageStripDesign.Warning});
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
  }

  function handleItems(items: Item[]) {
    if (barcodeRef == null || barcodeRef.current == null) {
      return;
    }
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
      onAddItem(items[0], selectedUnit);
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
  }

  const selectedUnitTest = units.find((unit) => unit.value === selectedUnit);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
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
      {unit && (
        <div className="space-y-2">
          <Label htmlFor="unit-select">{t('unit')}</Label>
          <Select onValueChange={handleUnitChanged} value={selectedUnit.toString()}>
            <SelectTrigger id="unit-select">
              <SelectValue placeholder={t('selectUnit')} />
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
      <div className="flex space-x-2">
        {onAddAction == null && (
          <Button type="submit" disabled={!enabled} className="w-full">
            <FontAwesomeIcon icon={faCheck} className="mr-2" />
            Accept
          </Button>
        )}
        {onAddAction && (
          <>
            <Button type="submit" disabled={!enabled} className="flex-1">
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
              Accept
            </Button>
            <Button variant="secondary" onClick={onAddAction} className="flex-1">
              {addActionIcon && <FontAwesomeIcon icon={addActionIcon} className="mr-2" />}
              {addActionLabel}
            </Button>
          </>
        )}
      </div>
    </form>
  );
});

export default BarCodeScanner;
