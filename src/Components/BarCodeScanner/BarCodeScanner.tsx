import React, {forwardRef, useImperativeHandle} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Check, Loader2} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {PackageDisplay} from './PackageDisplay';
import {ScanModeControls} from './ScanModeControls';
import {UnitSelector} from './UnitSelector';
import {BarCodeScannerProps, BarCodeScannerRef} from './types';
import {useAuth, useBarCodeScanner} from "@/components";
import {ScannerMode} from "@/features/login/data/login";

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
  const {unitSelection, user} = useAuth();

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
    handleClearPackage,
    isProcessing
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

  // item is true for example Transfer Request where the user is directly requesting an item
  const barcodeLabel = item ? t("code") :
    (user!.settings.scannerMode === ScannerMode.ItemBarcode || scanMode === 'package') ?
      t("barcode") : t("code");
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
      <ScanModeControls
        enablePackage={enablePackage}
        enablePackageCreate={enablePackageCreate}
        scanMode={scanMode}
        createPackage={createPackage}
        onScanModeChange={handleScanModeChange}
        onCreatePackageChange={setCreatePackage}
        disabled={isProcessing}
      />

      <PackageDisplay onClear={handleClearPackage} loadedPackage={loadedPackage} disabled={isProcessing}/>

      <div className="space-y-2">
        <Label 
          htmlFor="barcode-input" 
          className={isProcessing ? "text-muted-foreground" : ""}
        >
          {barcodeLabel}
        </Label>
        <Input
          id="barcode-input"
          required
          value={barcodeInput}
          ref={barcodeRef}
          onChange={(e) => setBarcodeInput(e.target.value)}
          disabled={!enabled || isProcessing}
        />
      </div>

      <UnitSelector
        visible={unit && unitSelection && scanMode === 'item'}
        pickPackOnly={pickPackOnly}
        selectedUnit={selectedUnit}
        onUnitChange={handleUnitChanged}
        disabled={isProcessing}
      />

      <div className="flex space-x-2">
        {onAddAction == null && (
          <Button type="submit" disabled={!enabled || isProcessing} className="w-full">
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            ) : (
              <Check className="mr-2 h-4 w-4"/>
            )}
            {scanMode === 'package' ? t('scanPackage') : t('accept')}
          </Button>
        )}
        {onAddAction && (
          <>
            <Button type="submit" disabled={!enabled || isProcessing} className="flex-1">
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
              ) : (
                <Check className="mr-2 h-4 w-4"/>
              )}
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