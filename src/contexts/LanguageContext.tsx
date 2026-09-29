'use client';

import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { Language } from '@/types';
import { translations, Translations } from '@/translations';

export interface LanguageContextType {
  readonly lang: Language;
  readonly t: Translations;
  readonly setLang: (selectedLang: Language) => void;
  readonly isTamil: boolean;
}

const STORAGE_KEY = 'uzhavar_language';

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('uzhavar_language_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('uzhavar_language_change', callback);
  };
}

function getSnapshot(): Language {
  try {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === 'ta' ? 'ta' : 'en';
    }
  } catch {
    // fallback
  }
  return 'en';
}

function getServerSnapshot(): Language {
  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lang = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((selectedLang: Language) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, selectedLang);
        window.dispatchEvent(new Event('uzhavar_language_change'));
        document.documentElement.lang = selectedLang;
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const value = useMemo<LanguageContextType>(() => {
    return {
      lang,
      t: translations[lang] || translations.en,
      setLang,
      isTamil: lang === 'ta',
    };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if called outside LanguageProvider (e.g. unit tests or early SSR)
    return {
      lang: 'en',
      t: translations.en,
      setLang: () => {},
      isTamil: false,
    };
  }
  return context;
}
