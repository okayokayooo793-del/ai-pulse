"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { en } from "@/locales/en";
import { zh } from "@/locales/zh";
import type { LocaleStrings } from "@/locales/en";

type Lang = "en" | "zh";

const locales: Record<Lang, LocaleStrings> = { en, zh };

interface LanguageContextType {
  lang: Lang;
  t: LocaleStrings;
  toggleLang: () => void;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  t: en,
  toggleLang: () => {},
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ai-pulse-lang");
    if (saved === "zh" || saved === "en") {
      setLangState(saved);
    } else {
      // Detect browser language
      const navLang = navigator.language.toLowerCase();
      setLangState(navLang.startsWith("zh") ? "zh" : "en");
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("ai-pulse-lang", l);
    document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "zh" : "en");
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, t: locales[lang], toggleLang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export type { Lang };
