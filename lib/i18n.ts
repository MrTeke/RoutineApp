import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import tr from './locales/tr';
import en from './locales/en';
import es from './locales/es';
import de from './locales/de';

export const LANGUAGE_KEY = 'app_language';

export const SUPPORTED_LANGUAGES = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', dateLocale: 'tr-TR' },
  { code: 'en', label: 'English', flag: '🇬🇧', dateLocale: 'en-US' },
  { code: 'es', label: 'Español', flag: '🇪🇸', dateLocale: 'es-ES' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', dateLocale: 'de-DE' },
];

// Senkron init — modül import edildiğinde hemen çalışır.
// useTranslation'ın NO_I18NEXT_INSTANCE hatası almaması için gerekli.
i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    es: { translation: es },
    de: { translation: de },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// AsyncStorage'dan kaydedilen dili okuyup uygular.
export async function initI18n(): Promise<void> {
  const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
  const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
  const supported = SUPPORTED_LANGUAGES.map((l) => l.code);
  const lng = savedLang ?? (supported.includes(deviceLang) ? deviceLang : 'en');
  await i18n.changeLanguage(lng);
}

export async function changeLanguage(code: string): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, code);
  await i18n.changeLanguage(code);
}

export function getDateLocale(): string {
  const lang = i18n.language;
  return SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.dateLocale ?? 'tr-TR';
}

export default i18n;
