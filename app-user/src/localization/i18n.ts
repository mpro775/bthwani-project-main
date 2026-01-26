// i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from 'expo-localization';

// بوليفيل للجمع (مهم للعربية)
import "@formatjs/intl-locale/polyfill";
import "@formatjs/intl-pluralrules/locale-data/ar";
import "@formatjs/intl-pluralrules/polyfill";

// استيراد ملفات الترجمة
import ar from '../locales/ar/common.json';
import en from '../locales/en/common.json';

const resources = {
  ar: {
    translation: ar
  },
  en: {
    translation: en
  }
};

// اكتشاف اللغة التلقائي
const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'ar';

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage, // استخدام لغة الجهاز التلقائية
  fallbackLng: "ar", // الرجوع للعربية إذا لم تكن متوفرة
  supportedLngs: ["ar", "en"], // دعم العربية والإنجليزية
  nonExplicitSupportedLngs: false,
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
});

export default i18n;
