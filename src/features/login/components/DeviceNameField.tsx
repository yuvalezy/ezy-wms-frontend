import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface DeviceNameFieldProps {
  requiresDeviceName: boolean;
  deviceNameTaken: boolean;
  deviceNameLabel: string;
  enterDeviceNameText: string;
  newDeviceDetectedText: string;
  deviceNameTakenText: string;
  disabled?: boolean;
}

export const DeviceNameField: React.FC<DeviceNameFieldProps> = ({
  requiresDeviceName,
  deviceNameTaken,
  deviceNameLabel,
  enterDeviceNameText,
  newDeviceDetectedText,
  deviceNameTakenText,
  disabled
}) => {
  if (!requiresDeviceName) return null;

  return (
    <>
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          {newDeviceDetectedText}
        </AlertDescription>
      </Alert>

      <div>
        <label htmlFor="newDeviceName" className="block text-sm font-medium text-gray-700 mb-1">
          {deviceNameLabel}
        </label>
        <input
          type="text"
          name="newDeviceName"
          id="newDeviceName"
          required
          maxLength={100}
          disabled={disabled}
          className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          placeholder={enterDeviceNameText}
        />
      </div>

      {deviceNameTaken && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {deviceNameTakenText}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};