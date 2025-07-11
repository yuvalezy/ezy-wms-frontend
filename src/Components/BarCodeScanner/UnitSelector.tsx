import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { UnitType } from '@/features/shared/data';

interface UnitSelectorProps {
  visible: boolean;
  pickPackOnly: boolean;
  selectedUnit: UnitType;
  onUnitChange: (value: string) => void;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  visible,
  pickPackOnly,
  selectedUnit,
  onUnitChange
}) => {
  const { t } = useTranslation();

  const units = [
    { text: t("unit"), value: UnitType.Unit },
    { text: t("dozen"), value: UnitType.Dozen },
    { text: t("box"), value: UnitType.Pack }
  ];

  if (!visible) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="unit-select">{t('unit')}</Label>
      <Select 
        disabled={pickPackOnly} 
        onValueChange={onUnitChange} 
        value={selectedUnit.toString()}
      >
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
  );
};