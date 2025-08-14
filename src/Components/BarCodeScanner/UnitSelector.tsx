import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { UnitType } from '@/features/shared/data';
import {useAuth} from "@/components";

interface UnitSelectorProps {
  visible: boolean;
  pickPackOnly: boolean;
  selectedUnit: UnitType;
  onUnitChange: (value: string) => void;
  disabled?: boolean;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  visible,
  pickPackOnly,
  selectedUnit,
  onUnitChange,
  disabled = false
}) => {
  const { t } = useTranslation();
  const {user} = useAuth();

  let units = [
    { text: t("inventory.units.unit.label"), value: UnitType.Unit },
    { text: t("inventory.units.dozen.label"), value: UnitType.Dozen },
    { text: t("inventory.units.box.label"), value: UnitType.Pack }
  ];

  if (!user?.settings.enableUseBaseUn)  {
    units = units.filter(unit => unit.value !== UnitType.Unit);
  }

  if (!visible) return null;

  return (
    <div className="space-y-2">
      <Label 
        htmlFor="unit-select" 
        className={disabled ? "text-muted-foreground" : ""}
      >
        {t('unit')}
      </Label>
      <Select 
        disabled={pickPackOnly || disabled} 
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