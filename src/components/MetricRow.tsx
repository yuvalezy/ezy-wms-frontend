import * as React from "react";

export interface MetricRowProps {
  label: string;
  values: {
    units: string | number;
    buyUnits: string | number;
    packUnits: string | number;
  };
}

export const MetricRow: React.FC<MetricRowProps> = ({label, values}) => (
  <div className="metric-row flex justify-between items-center py-2 border-b border-gray-200">
    <div className="w-[30%] font-medium">
      <span>{label}</span>
    </div>
    <div className="flex-1 flex justify-around text-center">
      <div className="flex-1">
        <span>{values.units}</span>
      </div>
      <div className="flex-1">
        <span>{values.buyUnits}</span>
      </div>
      <div className="flex-1">
        <span>{values.packUnits}</span>
      </div>
    </div>
  </div>
);