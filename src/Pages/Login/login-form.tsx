import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import {useTranslation} from 'react-i18next';
import {useAuth} from "@/components";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircle} from "lucide-react";

type Warehouse = {
  id: string;
  name: string;
};

type LoginFormProps = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  warehouses?: Warehouse[];
  requiresWarehouse?: boolean;
  errorMessage?: string;
  errorType?: string;
  onClearError?: () => void;
};

export default function LoginForm({onSubmit, warehouses, requiresWarehouse, errorMessage, errorType, onClearError}: LoginFormProps) {
  const {t, i18n} = useTranslation();
  const cookies = new Cookies();
  const {companyName} = useAuth();

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
            {companyName || 'COMPANY NAME'}
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {t('enter') || 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}