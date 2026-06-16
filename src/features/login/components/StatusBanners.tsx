import React from 'react';
import DeviceStatusBanner from '@/components/DeviceStatusBanner';
import AccountStatusBanner from '@/components/AccountStatusBanner';
import {DeviceStatus} from '@/features/devices/data/device';
import {AccountState} from '@/features/account/data/account';

interface StatusBannersProps {
  shouldShowAccountStatusBanner: boolean;
  shouldShowDeviceStatusBanner: boolean;
  accountStatus?: AccountState;
  expirationDate?: string;
  deviceStatus?: DeviceStatus;
  /** From `paymentAlert.showPaymentDetailAtLogin`; opts the login banner into the specific payment message. */
  showPaymentDetailAtLogin?: boolean;
}

export const StatusBanners: React.FC<StatusBannersProps> = ({
  shouldShowAccountStatusBanner,
  shouldShowDeviceStatusBanner,
  accountStatus,
  expirationDate,
  deviceStatus,
  showPaymentDetailAtLogin = false
}) => {
  return (
    <>
      {/* Account Status Banner */}
      {shouldShowAccountStatusBanner && accountStatus && (
        <div className="mt-4">
          <AccountStatusBanner
            accountStatus={accountStatus}
            expirationDate={expirationDate}
            variant="login"
            showExpirationDate={false}
            showPaymentDetailAtLogin={showPaymentDetailAtLogin}
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
            allowActivation={false} // Don't allow activation on login page
          />
        </div>
      )}
    </>
  );
};
