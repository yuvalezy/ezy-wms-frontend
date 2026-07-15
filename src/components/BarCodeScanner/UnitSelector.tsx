import React from 'react';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useTranslation} from 'react-i18next';
import {UnitType} from '@/features/shared/data';
import {useAuth} from "@/components";
import {getUnitLabel} from "@/utils/unit-settings";

interface UnitSelectorProps {
  visible: boolean;
  pickPackOnly: boolean;
  selectedUnit: UnitType;
  onUnitChange: (value: string) => void;
  disabled?: boolean;
  enableUseBaseUn?: boolean;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  visible,
  pickPackOnly,
  selectedUnit,
  onUnitChange,
  disabled = false,
  enableUseBaseUn: enableUseBaseUnProp,
}) => {
  const { t } = useTranslation();
  const {user} = useAuth();

  let settings = user!.settings!;
  const effectiveEnableUseBaseUn = enableUseBaseUnProp ?? settings.enableUseBaseUn;
  let units = [
    { text: getUnitLabel(UnitType.Unit, settings, t), value: UnitType.Unit },
    { text: getUnitLabel(UnitType.Dozen, settings, t), value: UnitType.Dozen },
    { text: getUnitLabel(UnitType.Pack, settings, t), value: UnitType.Pack }
  ];

  if (!effectiveEnableUseBaseUn)  {
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