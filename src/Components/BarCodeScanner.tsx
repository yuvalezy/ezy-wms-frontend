import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Button, ComboBox, ComboBoxItem, Form, FormItem, Grid, Input, InputDomRef} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react";
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
  addActionIcon?: string;
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
  const barcodeRef = useRef<InputDomRef>(null);
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
    const selected = units.find((unit) => unit.text === value);
    if (selected) {
      setSelectedUnit(selected.value);
    }
  }

  const selectedUnitTest = units.find((unit) => unit.value === selectedUnit);

  return (
    <Form onSubmit={handleSubmit} style={{paddingBottom: '3px', paddingTop: '6px'}}>
      <FormItem label={barcodeLabel}>
        <Input required
               value={barcodeInput}
               ref={barcodeRef}
               onInput={(e) => setBarcodeInput(e.target.value as string)}
               disabled={!enabled}
        ></Input>
      </FormItem>
      {unit && <FormItem label={t('unit')}>
          <ComboBox
              value={selectedUnitTest!.text!}
              onChange={(e) => handleUnitChanged(e.target.value)}
          >
            {units.map((unit) => (<ComboBoxItem key={unit.value} text={unit.text} />))}
          </ComboBox>
      </FormItem>}
      <FormItem>
        {onAddAction == null && <Button type="Submit" disabled={!enabled}>Accept</Button>}
        {onAddAction &&
            <Grid>
                <div>
                    <Button type="Submit" disabled={!enabled}>Accept</Button>
                </div>
                <div>
                    <Button color="secondary" icon={addActionIcon} onClick={onAddAction}>{addActionLabel}</Button>
                </div>
            </Grid>}
      </FormItem>
    </Form>
  );
});

export default BarCodeScanner;
