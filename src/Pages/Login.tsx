import React from 'react';
import {useLoginData} from '@/features/login/hooks/useLoginData';
import {ConnectionError, DeviceNameField, LanguageSelector, LoadingOverlay, LoginButton, LoginErrorAlert, LoginHeader, PasswordField, StatusBanners, WarehouseSelector} from '@/features/login/components';

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
    connectionError,
    isCompanyInfoLoading,
    currentLanguage,

    // Actions
    handleSubmit,
    handleLanguageChange,
    reloadCompanyInfo,

    // Status checks
    shouldShowDeviceStatusBanner,
    shouldShowAccountStatusBanner,
    isAccountDisabled,

    // Translation
    t,
  } = useLoginData();

  return (
    <>
      {connectionError && !isCompanyInfoLoading && (
        <ConnectionError
          onRetry={reloadCompanyInfo}
          retryText={t('retry') || 'Retry'}
          errorTitle={t('connectionError') || 'Connection Error'}
          errorMessage={t('cannotEstablishConnection') || 'Cannot establish connection to server'}
        />
      )}
      <div className="h-screen overflow-auto bg-gray-100">
        <div className="min-h-full flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 relative">
          {isCompanyInfoLoading && !connectionError && (
            <LoadingOverlay loadingText={t('loading') || 'Loading...'} />
          )}

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
            disabled={isAccountDisabled() || isCompanyInfoLoading}
          />

          <LanguageSelector
            label={t('language') || 'Language'}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            disabled={isAccountDisabled() || isCompanyInfoLoading}
          />

          <WarehouseSelector
            warehouses={warehouses}
            requiresWarehouse={requiresWarehouse}
            warehouseLabel={t('warehouse') || 'Warehouse'}
            selectWarehouseText={t('selectWarehouse') || 'Select a warehouse'}
            multipleWarehousesText={t('multipleWarehousesAvailable') || 'Multiple warehouses available. Please select one to continue.'}
            disabled={isAccountDisabled() || isCompanyInfoLoading}
          />

          <DeviceNameField
            requiresDeviceName={requiresDeviceName}
            deviceNameTaken={deviceNameTaken}
            deviceNameLabel={t('deviceName') || 'Device Name'}
            enterDeviceNameText={t('enterDeviceName') || 'Enter a device name (max 100 characters)'}
            newDeviceDetectedText={t('newDeviceDetected') || 'New device detected. Please provide a name for this device to continue.'}
            deviceNameTakenText={t('deviceNameTaken') || 'This device name is already taken. Please choose a different name.'}
            disabled={isAccountDisabled() || isCompanyInfoLoading}
          />

          <LoginButton
            text={t('enter') || 'Enter'}
            disabled={isAccountDisabled() || isCompanyInfoLoading}
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
      </div>
    </>
  );
}