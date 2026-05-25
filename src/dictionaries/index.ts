import { translations } from './translations';

export type Locale = keyof typeof translations;

export const getDictionary = (locale: string) => {
  return translations[locale as Locale] || translations.en;
};
