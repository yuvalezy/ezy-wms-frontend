import {ApplicationSettings, ResolvedUnitSettings} from "@/features/login/data/login";
import {UnitType} from "@/features/shared/data";

export function getUnitSettings(settings: ApplicationSettings, objectType?: string): ResolvedUnitSettings {
  const override = objectType ? settings.documentUnitOverrides?.[objectType] : undefined;
  return {
    defaultUnitType: override?.defaultUnitType ?? settings.defaultUnitType,
    enableUnitSelection: override?.enableUnitSelection ?? settings.enableUnitSelection,
    enableUseBaseUn: override?.enableUseBaseUn ?? settings.enableUseBaseUn,
    maxUnitLevel: override?.maxUnitLevel ?? settings.maxUnitLevel,
  };
}

/**
 * The operator-facing name of a unit rung: the configured label, falling back to the translated default.
 * Shared so anything naming a unit reads the same as the scanner's unit picker.
 */
export function getUnitLabel(
  unit: UnitType,
  settings: ApplicationSettings,
  t: (key: string) => string,
): string {
  switch (unit) {
    case UnitType.Unit:
      return settings.unitLabel ?? t("inventory.units.unit.label");
    case UnitType.Dozen:
      return settings.dozensLabel ?? t("inventory.units.dozen.label");
    case UnitType.Pack:
      return settings.boxLabel ?? t("inventory.units.box.label");
  }
}
