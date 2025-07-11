import React from 'react';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {Button} from '@/components/ui/button';
import {Check} from 'lucide-react';
import {useTranslation} from 'react-i18next';

interface ScanModeControlsProps {
  enablePackage: boolean,
  scanMode: 'item' | 'package',
  createPackage: boolean,
  onScanModeChange: (checked: boolean) => void,
  onCreatePackageChange: (value: boolean) => void,
  enablePackageCreate?: boolean
}

export const ScanModeControls: React.FC<ScanModeControlsProps> = ({
                                                                    enablePackage,
                                                                    scanMode,
                                                                    createPackage,
                                                                    onScanModeChange,
                                                                    onCreatePackageChange,
                                                                    enablePackageCreate
                                                                  }) => {
  const {t} = useTranslation();

  if (!enablePackage) return null;

  return (
    <div className="space-y-2">
      {scanMode === 'item' && enablePackageCreate && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-package"
            checked={createPackage}
            onCheckedChange={() => onCreatePackageChange(!createPackage)}
          />
          <Label htmlFor="create-package">{t('createNewPackage')}</Label>
        </div>
      )}
      <div className="flex rounded-md border">
        <Button
          type="button"
          variant="ghost"
          className={`flex-1 rounded-r-none flex items-center justify-center gap-2 ${
            scanMode === 'item' ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:bg-gray-100'
          }`}
          onClick={() => onScanModeChange(false)}
        >
          {scanMode === 'item' && <Check className="w-4 h-4" />}
          {t('scanItemMode')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={`flex-1 rounded-l-none flex items-center justify-center gap-2 ${
            scanMode === 'package' ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:bg-gray-100'
          }`}
          onClick={() => onScanModeChange(true)}
        >
          {scanMode === 'package' && <Check className="w-4 h-4" />}
          {t('scanPackageMode')}
        </Button>
      </div>
    </div>
  );
};