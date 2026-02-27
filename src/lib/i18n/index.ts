import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import * as de from './locales/de';
import * as en from './locales/en';

const SUPPORTED_LANGUAGES = ['en', 'de'] as const;
const FALLBACK_LANGUAGE = 'en';

function getDeviceLanguage(): string {
  const locales = getLocales();
  const deviceLang = locales[0]?.languageCode ?? FALLBACK_LANGUAGE;
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(deviceLang)
    ? deviceLang
    : FALLBACK_LANGUAGE;
}

export const defaultNS = 'common' as const;

export const resources = {
  en: {
    'add-plant': en.addPlant,
    auth: en.auth,
    common: en.common,
    community: en.community,
    garden: en.garden,
    harvest: en.harvest,
    profile: en.profile,
    scan: en.scan,
    schedule: en.schedule,
    strains: en.strains,
    'task-detail': en.taskDetail,
  },
  de: {
    'add-plant': de.addPlant,
    auth: de.auth,
    common: de.common,
    community: de.community,
    garden: de.garden,
    harvest: de.harvest,
    profile: de.profile,
    scan: de.scan,
    schedule: de.schedule,
    strains: de.strains,
    'task-detail': de.taskDetail,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  defaultNS,
  pluralSeparator: '_',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
