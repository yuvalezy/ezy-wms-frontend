import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

interface ScanModeControlsProps {
  enablePackage: boolean;
  scanMode: 'item' | 'package';
  createPackage: boolean;
  onScanModeChange: (checked: boolean) => void;
  onCreatePackageChange: (value: boolean) => void;
}

export const ScanModeControls: React.FC<ScanModeControlsProps> = ({
  enablePackage,
  scanMode,
  createPackage,
  onScanModeChange,
  onCreatePackageChange
}) => {
  const { t } = useTranslation();

  if (!enablePackage) return null;

  return (
    <div className="space-y-2">
      {scanMode === 'item' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-package"
            checked={createPackage}
            onCheckedChange={() => onCreatePackageChange(!createPackage)}
          />
          <Label htmlFor="create-package">{t('createNewPackage')}</Label>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Switch
          id="scan-mode"
          checked={scanMode === 'package'}
          onCheckedChange={onScanModeChange}
        />
        <Label htmlFor="scan-mode">
          {scanMode === 'package' ? t('scanPackageMode') : t('scanItemMode')}
        </Label>
      </div>
    </div>
  );
};