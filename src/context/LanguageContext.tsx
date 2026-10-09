import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Language,
  Translations,
  TranslationKey,
  translations,
  getTranslation,
} from '../lib/translations';

export type { Language, Translations, TranslationKey };
export { translations, getTranslation };

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
  strings: Translations;
  isBisaya: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kaonta_language');
      if (saved === 'en' || saved === 'ceb') {
        return saved;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kaonta_language', lang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ceb' : 'en');
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    return getTranslation(language, key, fallback);
  };

  const strings = useMemo<Translations>(() => {
    return translations[language] || translations.en;
  }, [language]);

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      strings,
      isBisaya: language === 'ceb',
      isEnglish: language === 'en',
    }),
    [language, strings]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

/**
 * Primary hook for accessing the active language, toggle handler,
 * and translation function `t` or localized strings dictionary.
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Hook for accessing localized strings and translation helpers
 * across all components.
 */
export function useTranslations(): LanguageContextType {
  return useLanguage();
}

/**
 * Common alias for useTranslations / useLanguage.
 */
export function useTranslation(): LanguageContextType {
  return useLanguage();
}
