import React, { forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useBarCodeScanner } from './useBarCodeScanner';
import { PackageDisplay } from './PackageDisplay';
import { ScanModeControls } from './ScanModeControls';
import { UnitSelector } from './UnitSelector';
import { BarCodeScannerProps, BarCodeScannerRef } from './types';

const BarCodeScanner = forwardRef<BarCodeScannerRef, BarCodeScannerProps>((
  {
    enabled,
    unit = false,
    item,
    onAddItem,
    onPackageChanged,
    onAddAction,
    addActionLabel,
    addActionIcon,
    pickPackOnly = false,
    enablePackage = false,
    currentPackage,
    objectType,
    objectId,
    objectNumber
  }, 
  ref
) => {
  const { t } = useTranslation();

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
    handleScanModeChange
  } = useBarCodeScanner({
    enabled,
    item,
    enablePackage,
    currentPackage,
    objectType,
    objectId,
    objectNumber,
    onAddItem,
    onPackageChanged
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
      <PackageDisplay loadedPackage={loadedPackage} />
      
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
        visible={unit && scanMode === 'item'}
        pickPackOnly={pickPackOnly}
        selectedUnit={selectedUnit}
        onUnitChange={handleUnitChanged}
      />

      <ScanModeControls
        enablePackage={enablePackage}
        scanMode={scanMode}
        createPackage={createPackage}
        onScanModeChange={handleScanModeChange}
        onCreatePackageChange={setCreatePackage}
      />

      <div className="flex space-x-2">
        {onAddAction == null && (
          <Button type="submit" disabled={!enabled} className="w-full">
            <FontAwesomeIcon icon={faCheck} className="mr-2"/>
            {scanMode === 'package' ? t('scanPackage') : t('accept')}
          </Button>
        )}
        {onAddAction && (
          <>
            <Button type="submit" disabled={!enabled} className="flex-1">
              <FontAwesomeIcon icon={faCheck} className="mr-2"/>
              {scanMode === 'package' ? t('scanPackage') : t('accept')}
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

BarCodeScanner.displayName = 'BarCodeScanner';

export default BarCodeScanner;