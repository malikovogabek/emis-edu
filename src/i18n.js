import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import uzbek from "./locales/uzbek.json";
import russian from "./locales/russian.json";
import english from "./locales/english.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uzbek: { translation: uzbek },
      russian: { translation: russian },
      english: { translation: english },
    },
    fallbackLng: "uzbek",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
