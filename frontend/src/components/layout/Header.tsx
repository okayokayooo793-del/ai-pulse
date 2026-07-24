"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Monitor, Search as SearchIcon, Menu } from "lucide-react";
import { useState, useCallback } from "react";

interface HeaderProps {
  onSearchOpen?: () => void;
}

export function Header({ onSearchOpen }: HeaderProps) {
  const { lang, t, toggleLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);

  const nextTheme = useCallback(() => {
    const order: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % 3]);
    setThemeOpen(false);
  }, [theme, setTheme]);

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-bold text-lg text-text-primary dark:text-text-dark shrink-0">
          <span className="text-2xl">🤖</span>
          <span className="hidden sm:inline bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            AI Pulse
          </span>
        </a>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            onClick={onSearchOpen}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-secondary dark:text-text-darkSecondary"
            aria-label={t.search}
          >
            <SearchIcon size={18} />
          </button>

          {/* Theme toggle */}
          <div className="relative">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-secondary dark:text-text-darkSecondary"
              title={t.theme[theme]}
            >
              <ThemeIcon size={18} />
            </button>
            {themeOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]">
                {(["light", "dark", "system"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTheme(t); setThemeOpen(false); }}
                    className={`w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700
                      ${theme === t ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-text-secondary dark:text-text-darkSecondary"}`}
                  >
                    {t === "light" ? "☀️ " : t === "dark" ? "🌙 " : "🖥️ "}
                    {t === "light" ? "Light" : t === "dark" ? "Dark" : "System"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-text-primary dark:text-text-dark"
          >
            {t.language}
          </button>
        </div>
      </div>
    </header>
  );
}
