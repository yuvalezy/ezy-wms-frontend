import i18next from 'i18next';
import {initReactI18next} from "react-i18next";

import translationEnglish from './Translations/English/translation.json';
import translationSpanish from './Translations/Spanish/translation.json';

const resources = {
    en: {
        translation: translationEnglish
    },
    es: {
        translation: translationSpanish
    }
}
i18next
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        resources,
        lng: 'en',
        react: {
            useSuspense: false,
        },
    });

export default i18next;