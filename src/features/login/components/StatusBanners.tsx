import React from 'react';
import DeviceStatusBanner from '@/components/DeviceStatusBanner';
import AccountStatusBanner from '@/components/AccountStatusBanner';
import { DeviceStatus } from '@/features/devices/data/device';
import { AccountState } from '@/features/account/data/account';

interface StatusBannersProps {
  shouldShowAccountStatusBanner: boolean;
  shouldShowDeviceStatusBanner: boolean;
  accountStatus?: AccountState;
  deviceStatus?: DeviceStatus;
}

export const StatusBanners: React.FC<StatusBannersProps> = ({
  shouldShowAccountStatusBanner,
  shouldShowDeviceStatusBanner,
  accountStatus,
  deviceStatus
}) => {
  return (
    <>
      {/* Account Status Banner */}
      {shouldShowAccountStatusBanner && accountStatus && (
        <div className="mt-4">
          <AccountStatusBanner
            accountStatus={accountStatus}
            className="w-full"
          />
        </div>
      )}

      {/* Device Status Banner */}
      {shouldShowDeviceStatusBanner && deviceStatus && (
        <div className="mt-4">
          <DeviceStatusBanner
            deviceStatus={deviceStatus}
            onClose={() => {}} // No-op since this is just informational on login
            showBorder={true}
            showCloseButton={false}
          />
        </div>
      )}
    </>
  );
};