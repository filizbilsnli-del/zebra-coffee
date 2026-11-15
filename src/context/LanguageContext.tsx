"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Language = "AZ" | "EN";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  isAZ: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("AZ");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("zebra-language");

    if (savedLanguage === "AZ" || savedLanguage === "EN") {
      setLanguageState(savedLanguage);
    }

    setLoaded(true);
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("zebra-language", newLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, isAZ: language === "AZ" }}
    >
      {loaded ? children : null}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
