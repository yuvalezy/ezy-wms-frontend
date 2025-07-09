import React, {forwardRef, useImperativeHandle, useRef, useState, useEffect} from 'react';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "./ThemeContext";
import {getPackageByBarcode} from "@/pages/packages/hooks";
import {PackageDto} from "@/pages/packages/types";
import {Check} from 'lucide-react';

export interface PackageScannerProps {
  label?: string | boolean;
  showLabel?: boolean;
  onScan?: (packageData: PackageDto) => void;
  onChanged?: (packageData: PackageDto) => void;
  onClear?: () => void;
}

export interface PackageScannerRef {
  focus: () => void;
  clear: () => void;
  getBarcode: () => string;
}

const PackageScanner = forwardRef<PackageScannerRef, PackageScannerProps>((
  {
    onScan,
    onChanged,
    onClear,
    label,
    showLabel = true
  }, ref) => {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [packageData, setPackageData] = useState<PackageDto | null>(null);

  // Auto-focus the input when component mounts and when package is cleared
  useEffect(() => {
    if (!packageData) {
      barcodeRef.current?.focus();
    }
  }, [packageData]);

  useImperativeHandle(ref, () => ({
    focus() {
      barcodeRef?.current?.focus();
    },
    clear() {
      clear();
    },
    getBarcode() {
      return barcodeInput;
    }
  }));

  const clear = () => {
    setBarcodeInput('');
    setPackageData(null);
    onClear?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setLoading(true);
    try {
      const result = await getPackageByBarcode({
        barcode: barcodeInput.trim(),
        contents: true,
        details: true
      });
      
      if (result) {
        setPackageData(result);
        onScan?.(result);
        onChanged?.(result);
      } else {
        setError(new Error(t('packages.packageNotFound')));
      }
    } catch (error: any) {
      // Check if it's a 404 error (package not found)
      if (error?.response?.status === 404) {
        setError(new Error(t('packages.packageNotFound')));
        setBarcodeInput(''); // Clear input on package not found
      } else {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const displayLabel = typeof label === 'string' ? label : 
    (label !== false ? t('packages.scanPackageBarcode') : undefined);

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="space-y-4">
          <div className="space-y-2">
            {showLabel && displayLabel && (
              <Label htmlFor="package-barcode-input">{displayLabel}</Label>
            )}
            <Input
              id="package-barcode-input"
              required
              value={barcodeInput}
              ref={barcodeRef}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder={t('packages.packageBarcode')}
              maxLength={255}
            />
          </div>
          <div>
            <Button type="submit" disabled={!barcodeInput.trim()} className="w-full">
              <Check className="h-4 w-4 mr-2"/>
              {t('accept')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
});

PackageScanner.displayName = 'PackageScanner';

export default PackageScanner;