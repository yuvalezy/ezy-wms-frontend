import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DeviceStatus } from '@/pages/settings/devices/data/device';

interface DeviceStatusBannerProps {
  deviceStatus: DeviceStatus;
  onClose: () => void;
}

const DeviceStatusBanner: React.FC<DeviceStatusBannerProps> = ({ deviceStatus, onClose }) => {
  const { t } = useTranslation();

  const getBannerConfig = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.Inactive:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          message: t('deviceStatusBanner.inactive', 'Your device is currently inactive. Please contact your administrator.')
        };
      case DeviceStatus.Disabled:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          message: t('deviceStatusBanner.disabled', 'Your device has been disabled. Please contact your administrator.')
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig(deviceStatus);

  if (!config) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between p-4 ${config.bgColor} w-full`} style={{ left: '0px', right: '0px' }}>
      <div className="flex items-center">
        <AlertTriangle className={`h-5 w-5 ${config.iconColor} mr-3 flex-shrink-0`} />
        <p className={`text-sm font-medium ${config.textColor}`}>
          {config.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className={`${config.textColor} hover:bg-opacity-20 hover:bg-gray-500 rounded-full p-1 transition-colors`}
        aria-label={t('close', 'Close')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DeviceStatusBanner;