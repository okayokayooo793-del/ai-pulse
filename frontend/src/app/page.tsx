"use client";

import { useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useDailyDigest, useDigestIndex } from "@/hooks/useArticles";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { DailyBrief } from "@/components/digest/DailyBrief";
import { Timeline } from "@/components/timeline/Timeline";
import { NewsCardSkeleton } from "@/components/cards/NewsCard";
import { SearchPanel } from "@/components/search/SearchPanel";

export default function HomePage() {
  const { lang, t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");

  const { data: digest, isLoading, error } = useDailyDigest();
  const { data: index } = useDigestIndex();

  const availableDates = useMemo(() => {
    if (!index) return [];
    return Object.keys(index).sort().reverse();
  }, [index]);

  return (
    <div className="min-h-screen">
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar
            selectedCategory={selectedCategory}
            selectedSource={selectedSource}
            onCategoryChange={setSelectedCategory}
            onSourceChange={setSelectedSource}
            availableDates={availableDates}
          />

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark">
                🤖 {t.digest.todayDigest}
              </h1>
              <p className="mt-1 text-sm text-text-secondary dark:text-text-darkSecondary">
                {digest?.date || "---"} · {t.subtitle}
              </p>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="py-20 text-center text-red-500">
                <p className="text-lg">⚠️</p>
                <p>{t.digest.error}</p>
              </div>
            )}

            {/* Content */}
            {digest && (
              <>
                <DailyBrief digest={digest} />
                <div className="mt-8">
                  <Timeline
                    articles={digest.articles}
                    categoryFilter={selectedCategory}
                    sourceFilter={selectedSource}
                  />
                </div>
              </>
            )}

            {/* Empty */}
            {!isLoading && !error && !digest && (
              <div className="py-20 text-center text-text-secondary dark:text-text-darkSecondary">
                <p className="text-3xl mb-2">📭</p>
                <p>{t.digest.noArticles}</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-text-secondary dark:text-text-darkSecondary">
          {t.misc.poweredBy} · <a href="/archive" className="hover:text-indigo-600 dark:hover:text-indigo-400 underline">{t.misc.archive}</a>
        </div>
      </footer>
    </div>
  );
}
