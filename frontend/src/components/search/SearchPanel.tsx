"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useSearch } from "@/hooks/useSearch";
import { SourceIcon } from "@/components/common/SourceIcon";
import { ScoreBadge } from "@/components/common/ScoreBadge";
import type { SourceType } from "@/lib/types";
import { Search, X, ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPanel({ open, onClose }: SearchPanelProps) {
  const { lang, t } = useLanguage();
  const { query, results, loading, search, setQuery } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      search("");
    }
  }, [open, setQuery, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <Search size={18} className="text-text-secondary dark:text-text-darkSecondary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => search(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-1 bg-transparent outline-none text-text-primary dark:text-text-dark placeholder:text-gray-400"
              />
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="px-4 py-8 text-center text-text-secondary animate-pulse">
                  Searching...
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="px-4 py-8 text-center text-text-secondary">
                  <p className="text-lg mb-1">🔍</p>
                  <p>{t.misc.noResults}</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="py-2">
                  {results.map((result) => (
                    <a
                      key={result.id}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <SourceIcon type={result.source_type as SourceType} size={14} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary dark:text-text-dark group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">
                          {lang === "zh" ? (result.title_zh || result.title_en) : (result.title_en || result.title_zh)}
                        </p>
                        <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-0.5">
                          {result.source_name} · {result.date}
                        </p>
                      </div>
                      <ScoreBadge score={result.score} size="sm" />
                    </a>
                  ))}
                </div>
              )}

              {!query && (
                <div className="px-4 py-8 text-center text-text-secondary">
                  <p className="text-2xl mb-2">🤖</p>
                  <p className="text-sm">
                    {lang === "zh" ? "输入关键词搜索 AI 新闻" : "Type to search AI news"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
