import React from 'react';
import { useLoginData } from '@/features/login/hooks/useLoginData';
import {
  LoginHeader,
  LoginErrorAlert,
  PasswordField,
  LanguageSelector,
  WarehouseSelector,
  DeviceNameField,
  LoginButton,
  StatusBanners
} from '@/features/login/components';

export default function Login() {
  const {
    // State
    warehouses,
    requiresWarehouse,
    requiresDeviceName,
    deviceNameTaken,
    errorMessage,
    errorType,
    companyInfo,
    currentLanguage,
    
    // Actions
    handleSubmit,
    handleLanguageChange,
    
    // Status checks
    shouldShowDeviceStatusBanner,
    shouldShowAccountStatusBanner,
    isAccountDisabled,
    
    // Translation
    t,
  } = useLoginData();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8">
        <LoginHeader
          companyName={companyInfo?.companyName}
          loginText={t('login') || 'Login'}
        />

        <LoginErrorAlert
          errorMessage={errorMessage}
          errorType={errorType}
          invalidGrantText={t('invalidGrant') || 'Invalid password or account disabled'}
          loginErrorText={t('loginError') || 'Error during login'}
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            label={t('code') || 'Code'}
            disabled={isAccountDisabled()}
          />

          <LanguageSelector
            label={t('language') || 'Language'}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            disabled={isAccountDisabled()}
          />

          <WarehouseSelector
            warehouses={warehouses}
            requiresWarehouse={requiresWarehouse}
            warehouseLabel={t('warehouse') || 'Warehouse'}
            selectWarehouseText={t('selectWarehouse') || 'Select a warehouse'}
            multipleWarehousesText={t('multipleWarehousesAvailable') || 'Multiple warehouses available. Please select one to continue.'}
            disabled={isAccountDisabled()}
          />

          <DeviceNameField
            requiresDeviceName={requiresDeviceName}
            deviceNameTaken={deviceNameTaken}
            deviceNameLabel={t('deviceName') || 'Device Name'}
            enterDeviceNameText={t('enterDeviceName') || 'Enter a device name (max 100 characters)'}
            newDeviceDetectedText={t('newDeviceDetected') || 'New device detected. Please provide a name for this device to continue.'}
            deviceNameTakenText={t('deviceNameTaken') || 'This device name is already taken. Please choose a different name.'}
            disabled={isAccountDisabled()}
          />

          <LoginButton
            text={t('enter') || 'Enter'}
            disabled={isAccountDisabled()}
          />
        </form>

        <StatusBanners
          shouldShowAccountStatusBanner={shouldShowAccountStatusBanner()}
          shouldShowDeviceStatusBanner={shouldShowDeviceStatusBanner()}
          accountStatus={companyInfo?.accountStatus}
          deviceStatus={companyInfo?.deviceStatus}
        />
      </div>
    </div>
  );
}