import { en } from './en';
import { ta } from './ta';

export const translations = {
  en,
  ta,
};

export type Translations = typeof en;
export type TranslationKey = keyof Translations;
