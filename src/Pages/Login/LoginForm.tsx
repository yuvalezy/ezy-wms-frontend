import React, { useEffect } from 'react';
import Cookies from 'universal-cookie';
import { useTranslation } from 'react-i18next';
import { globalConfig } from '../../Assets/GlobalConfig';

type LoginFormProps = {
    onSubmit: React.FormEventHandler<HTMLFormElement>;
};

export default function LoginForm({ onSubmit }: LoginFormProps) {
    const { t, i18n } = useTranslation();
    const cookies = new Cookies();

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
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
                  {globalConfig?.companyName || 'UNIT_TEST'}
              </h2>
              <p className="text-center text-gray-500 mb-6">{t('login') || 'Login'}</p>

              <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('code') || 'Code'}
                      </label>
                      <input
                        type="password"
                        name="username"
                        id="username"
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
