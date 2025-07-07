import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import {useTranslation} from 'react-i18next';
import {useAuth} from "@/components";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircle} from "lucide-react";
import {LicenseWarningType} from "@/types/license";
import {StringFormat} from "@/assets";
import DeviceStatusBanner from "@/components/DeviceStatusBanner";
import {DeviceStatus} from "@/pages/settings/devices/data/device";

type Warehouse = {
  id: string;
  name: string;
};

type LoginFormProps = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  warehouses?: Warehouse[];
  requiresWarehouse?: boolean;
  requiresDeviceName?: boolean;
  deviceNameTaken?: boolean;
  errorMessage?: string;
  errorType?: string;
  onClearError?: () => void;
};

export default function LoginForm({
                                    onSubmit,
                                    warehouses,
                                    requiresWarehouse,
                                    requiresDeviceName,
                                    deviceNameTaken,
                                    errorMessage,
                                    errorType,
                                    onClearError
                                  }: LoginFormProps) {
  const {t, i18n} = useTranslation();
  const cookies = new Cookies();
  const {companyInfo} = useAuth();

  const shouldShowDeviceStatusBanner = () => {
    return companyInfo?.deviceStatus && companyInfo.deviceStatus !== DeviceStatus.Active;
  };

  useEffect(() => {
    const savedLang = cookies.get('userLanguage');
    const browserLang = navigator.language.split('-')[0];
    const lang = savedLang || (['en', 'es'].includes(browserLang) ? browserLang : 'en');
    i18n.changeLanguage(lang);
  }, [i18n]);

  const onLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    cookies.set('userLanguage', lang, {
      path: '/',
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/images/ezy_wms.png"
            alt="Company Logo"
            className="w-auto h-20 mb-4 object-contain"
          />
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
            {companyInfo?.companyName || 'COMPANY NAME'}
          </h2>
          <p className="text-center text-gray-500">{t('login') || 'Login'}</p>
        </div>

        {(errorMessage || errorType) && (
          <Alert className="bg-red-50 border-red-200 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600"/>
            <AlertDescription className="text-red-800">
              {errorType === 'invalid_grant'
                ? (t('invalidGrant') || 'Invalid password or account disabled')
                : `${t('loginError') || 'Error during login'}: ${errorMessage}`
              }
            </AlertDescription>
          </Alert>
        )}

        {companyInfo?.licenseWarnings?.map(warning => {
          let translationMessage = t('licenseIssueDetected');
          const isError = warning.type === LicenseWarningType.PaymentDue;
          switch (warning.type) {
            case LicenseWarningType.PaymentDue:
              translationMessage = t('paymentDue');
              break;
            case LicenseWarningType.PaymentStatusUnknown:
              translationMessage = StringFormat(t('paymentStatusUnknown'), warning.data?.[0] ?? 'Unknown');
              break;
            case LicenseWarningType.AccountExpiresIn:
              translationMessage = StringFormat(t('accountExpiresIn'), warning.data?.[0] ?? 'Unknown');
              break;
          }
          return (
            <Alert key={warning.type} className={isError ? 'bg-red-50 border-red-200 mb-4' : 'bg-yellow-50 border-yellow-200 mb-4'}>
              <AlertCircle className="h-4 w-4 text-yellow-600"/>
              <AlertDescription className="text-yellow-800">
                {translationMessage}
              </AlertDescription>
            </Alert>
          );
        })}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              {t('code') || 'Code'}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              {t('language') || 'Language'}
            </label>
            <select
              name="language"
              id="language"
              value={i18n.language}
              onChange={onLanguageChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          {requiresWarehouse && warehouses && (
            <>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600"/>
                <AlertDescription className="text-blue-800">
                  {t('multipleWarehousesAvailable') || 'Multiple warehouses available. Please select one to continue.'}
                </AlertDescription>
              </Alert>

              <div>
                <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('warehouse') || 'Warehouse'}
                </label>
                <select
                  name="warehouse"
                  id="warehouse"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t('selectWarehouse') || 'Select a warehouse'}
                  </option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {requiresDeviceName && (
            <>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600"/>
                <AlertDescription className="text-blue-800">
                  {t('newDeviceDetected') || 'New device detected. Please provide a name for this device to continue.'}
                </AlertDescription>
              </Alert>

              <div>
                <label htmlFor="newDeviceName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('deviceName') || 'Device Name'}
                </label>
                <input
                  type="text"
                  name="newDeviceName"
                  id="newDeviceName"
                  required
                  maxLength={100}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enterDeviceName') || 'Enter a device name (max 100 characters)'}
                />
              </div>
            </>
          )}

          {deviceNameTaken && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600"/>
              <AlertDescription className="text-red-800">
                {t('deviceNameTaken') || 'This device name is already taken. Please choose a different name.'}
              </AlertDescription>
            </Alert>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {t('enter') || 'Enter'}
          </button>
        </form>

        {/* Device Status Banner */}
        {shouldShowDeviceStatusBanner() && (
          <div className="mt-4">
            <DeviceStatusBanner
              deviceStatus={companyInfo!.deviceStatus!}
              onClose={() => {}} // No-op since this is just informational on login
              showBorder={true}
              showCloseButton={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}