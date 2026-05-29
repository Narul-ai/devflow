import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импорт словарей (JSON файлов)
import translationRU from './locales/ru.json';
import translationEN from './locales/en.json';
import translationZH from './locales/zh.json';

const resources = {
  ru: { translation: translationRU },
  en: { translation: translationEN },
  zh: { translation: translationZH }
};

i18n
  // Подключаем плагин автоматического определения языка пользователя
  .use(LanguageDetector)
  // Интегрируем i18n с React (хуки useTranslation и т.д.)
  .use(initReactI18next)
  // Инициализируем настройки
  .init({
    resources,
    
    // Настройки определения языка
    detection: {
      // Порядок проверки: сначала смотрим сохраненный в localStorage, 
      // затем в куках, и только потом проверяем язык самого браузера
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      // Название ключа, под которым язык будет лежать в кэше
      caches: ['localStorage', 'cookie'],
    },

    // Если язык пользователя не RU/EN/ZH, то принудительно включаем английский
    fallbackLng: 'en', 

    // Разрешаем использовать ключи с точками (например, 'login.title')
    keySeparator: '.', 

    interpolation: {
      // React сам защищает от XSS-атак, встроенное экранирование i18next не нужно
      escapeValue: false 
    },

    // ИСПРАВЛЕНО: Вместо process.env, который ломает Vite на продакшене, используем import.meta.env.DEV
    debug: import.meta.env.DEV,
  });

export default i18n;