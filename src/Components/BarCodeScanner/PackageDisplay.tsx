import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { PackageValue } from './types';

interface PackageDisplayProps {
  loadedPackage: PackageValue | null | undefined;
}

export const PackageDisplay: React.FC<PackageDisplayProps> = ({ loadedPackage }) => {
  const { t } = useTranslation();

  if (!loadedPackage) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="current-package">{t('currentPackage')}</Label>
      <Input
        id="current-package"
        value={loadedPackage.barcode}
        readOnly
      />
    </div>
  );
};