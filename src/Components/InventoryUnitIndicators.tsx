import React from "react";
import {useTranslation} from "react-i18next";
import {useAuth} from "@/components";

interface InventoryUnitIndicatorsProps {
  packages: number;
  dozens: number;
  units: number;
}

export const InventoryUnitIndicators: React.FC<InventoryUnitIndicatorsProps> = ({
  packages,
  dozens,
  units,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const settings = user!.settings;

  return (
    <div className="flex items-center">
      <div className="flex gap-1">
        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
          packages > 0 ? 'bg-blue-500' : 'bg-gray-200'
        }`}>
          {settings.unitAbbr ?? t('inventory.units.box.abbr')}
        </span>
        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
          dozens > 0 ? 'bg-green-500' : 'bg-gray-200'
        }`}>
          {settings.dozensAbbr ?? t('inventory.units.dozen.abbr')}
        </span>
        {user?.settings.enableUseBaseUn && (
          <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
            units > 0 ? 'bg-amber-500' : 'bg-gray-200'
          }`}>
            {settings.boxAbbr ?? t('inventory.units.unit.abbr')}
          </span>
        )}
      </div>
    </div>
  );
};