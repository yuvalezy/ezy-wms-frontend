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
