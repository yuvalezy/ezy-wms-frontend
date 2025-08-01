import React from 'react';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {useTranslation} from 'react-i18next';
import {PackageValue} from './types';
import {Button} from "@/components";

interface PackageDisplayProps {
  loadedPackage: PackageValue | null | undefined;
  onClear: () => void;
}

export const PackageDisplay: React.FC<PackageDisplayProps> = ({loadedPackage, onClear}) => {
  const {t} = useTranslation();

  if (!loadedPackage) return null;

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-300 truncate">
                      {t("currentPackage")}: {loadedPackage.barcode}
                  </span>
      <Button type="button" variant="outline" size="sm" onClick={onClear} className="w-full sm:w-auto shrink-0">
        {t("clearPackage")}
      </Button>
    </div>
  );
};