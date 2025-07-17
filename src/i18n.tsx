import i18next from 'i18next';
import {initReactI18next} from "react-i18next";
import Cookies from 'universal-cookie';

import translationEnglish from './translations/English/translation.json';
import translationSpanish from './translations/Spanish/translation.json';

const resources = {
    en: {
        translation: translationEnglish
    },
    es: {
        translation: translationSpanish
    }
}

// Get language from cookie synchronously before initialization
const cookies = new Cookies();
const savedLang = cookies.get('userLanguage');
const browserLang = navigator.language.split('-')[0];
const initialLang = savedLang || (['en', 'es'].includes(browserLang) ? browserLang : 'en');

i18next
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        resources,
        lng: initialLang,
        react: {
            useSuspense: false,
        },
    });

export default i18next;