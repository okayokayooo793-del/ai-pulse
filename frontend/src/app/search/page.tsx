"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useSearch } from "@/hooks/useSearch";
import { Header } from "@/components/layout/Header";
import { SourceIcon } from "@/components/common/SourceIcon";
import { ScoreBadge } from "@/components/common/ScoreBadge";
import type { SourceType } from "@/lib/types";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";

export default function SearchPage() {
  const { lang, t } = useLanguage();
  const { query, results, loading, search, setQuery } = useSearch();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <Link href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">
          ← {t.misc.backToHome}
        </Link>

        {/* Search input */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark mb-6">
          <Search size={20} className="text-text-secondary dark:text-text-darkSecondary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent outline-none text-lg text-text-primary dark:text-text-dark placeholder:text-gray-400"
            autoFocus
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-8 text-center text-text-secondary animate-pulse">
            Searching across all digests...
          </div>
        )}

        {/* No results */}
        {!loading && query && results.length === 0 && (
          <div className="py-20 text-center text-text-secondary">
            <p className="text-3xl mb-2">🔍</p>
            <p>{t.misc.noResults}</p>
          </div>
        )}

        {/* Empty state */}
        {!query && (
          <div className="py-20 text-center text-text-secondary">
            <p className="text-3xl mb-2">🤖</p>
            <p className="text-sm">{lang === "zh" ? "输入关键词搜索 AI 新闻" : "Type to search AI news"}</p>
          </div>
        )}

        {/* Results */}
        {results.map((result) => (
          <a
            key={result.id}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700
              hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-card-dark mb-3 group transition-all"
          >
            <SourceIcon type={result.source_type as SourceType} size={16} />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-text-primary dark:text-text-dark group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {lang === "zh" ? (result.title_zh || result.title_en) : (result.title_en || result.title_zh)}
              </h3>
              <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-1">
                {result.source_name} · {result.date}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ScoreBadge score={result.score} size="sm" />
              <ExternalLink size={14} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
