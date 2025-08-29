import React from 'react';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertCircle} from 'lucide-react';
import {Warehouse} from '../hooks/useLoginData';

interface WarehouseSelectorProps {
  warehouses: Warehouse[];
  requiresWarehouse: boolean;
  warehouseLabel: string;
  selectWarehouseText: string;
  multipleWarehousesText: string;
  disabled?: boolean;
}

export const WarehouseSelector: React.FC<WarehouseSelectorProps> = ({
  warehouses,
  requiresWarehouse,
  warehouseLabel,
  selectWarehouseText,
  multipleWarehousesText,
  disabled
}) => {
  if (!requiresWarehouse || !warehouses.length) return null;

  return (
    <>
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          {multipleWarehousesText}
        </AlertDescription>
      </Alert>

      <div>
        <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700 mb-1">
          {warehouseLabel}
        </label>
        <select
          name="warehouse"
          id="warehouse"
          required
          disabled={disabled}
          className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          defaultValue=""
        >
          <option value="" disabled>
            {selectWarehouseText}
          </option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};