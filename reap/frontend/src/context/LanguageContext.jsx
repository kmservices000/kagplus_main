import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { learnerLanguages } from '../data/languages';

const STORAGE_KEY = 'reap-language';

const defaultLanguage = learnerLanguages[0];

const LanguageContext = createContext({
  language: defaultLanguage,
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultLanguage;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id && learnerLanguages.find((lang) => lang.id === parsed.id)) {
          return parsed;
        }
      }
    } catch {
      // ignore storage parsing errors
    }
    return defaultLanguage;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(language));
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);
