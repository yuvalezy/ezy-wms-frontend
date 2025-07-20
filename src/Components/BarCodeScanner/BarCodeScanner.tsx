import React, {forwardRef, useImperativeHandle} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Check} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {PackageDisplay} from './PackageDisplay';
import {ScanModeControls} from './ScanModeControls';
import {UnitSelector} from './UnitSelector';
import {BarCodeScannerProps, BarCodeScannerRef} from './types';
import {useAuth, useBarCodeScanner} from "@/components";

const BarCodeScanner = forwardRef<BarCodeScannerRef, BarCodeScannerProps>((
  {
    enabled,
    unit = false,
    item,
    onAddItem,
    onAddPackage,
    onPackageChanged,
    onAddAction,
    addActionLabel,
    addActionIcon,
    pickPackOnly = false,
    enablePackage = false,
    enablePackageCreate = true,
    currentPackage,
    objectType,
    objectId,
    objectNumber,
    binEntry,
    isEphemeralPackage = true
  },
  ref
) => {
  const {t} = useTranslation();
  const {unitSelection} = useAuth();

  const {
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
    handleClearPackage
  } = useBarCodeScanner({
    enabled,
    item,
    enablePackage,
    currentPackage,
    objectType,
    objectId,
    objectNumber,
    onAddItem,
    onAddPackage,
    onPackageChanged,
    binEntry,
    isEphemeralPackage
  });

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

  const barcodeLabel = !item ? t("barcode") : t("code");

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
      <ScanModeControls
        enablePackage={enablePackage}
        enablePackageCreate={enablePackageCreate}
        scanMode={scanMode}
        createPackage={createPackage}
        onScanModeChange={handleScanModeChange}
        onCreatePackageChange={setCreatePackage}
      />

      <PackageDisplay onClear={handleClearPackage} loadedPackage={loadedPackage}/>

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

      <UnitSelector
        visible={unit && unitSelection && scanMode === 'item'}
        pickPackOnly={pickPackOnly}
        selectedUnit={selectedUnit}
        onUnitChange={handleUnitChanged}
      />

      <div className="flex space-x-2">
        {onAddAction == null && (
          <Button type="submit" disabled={!enabled} className="w-full">
            <Check className="mr-2 h-4 w-4"/>
            {scanMode === 'package' ? t('scanPackage') : t('accept')}
          </Button>
        )}
        {onAddAction && (
          <>
            <Button type="submit" disabled={!enabled} className="flex-1">
              <Check className="mr-2 h-4 w-4"/>
              {scanMode === 'package' ? t('scanPackage') : t('accept')}
            </Button>
            <Button variant="secondary" onClick={onAddAction} className="flex-1">
              {addActionIcon && React.createElement(addActionIcon, {className: "mr-2 h-4 w-4"})}
              {addActionLabel}
            </Button>
          </>
        )}
      </div>
    </form>
  );
});

BarCodeScanner.displayName = 'BarCodeScanner';

export default BarCodeScanner;