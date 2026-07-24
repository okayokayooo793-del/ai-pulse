"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useDigestIndex } from "@/hooks/useArticles";
import { Header } from "@/components/layout/Header";
import { CATEGORY_LABELS_EN, CATEGORY_LABELS_ZH, CATEGORY_EMOJI } from "@/lib/types";
import type { Category } from "@/lib/types";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

export default function ArchivePage() {
  const { lang, t } = useLanguage();
  const { data: index, isLoading } = useDigestIndex();

  const dates = index ? Object.keys(index).sort().reverse() : [];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block"
          >
            ← {t.misc.backToHome}
          </Link>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark flex items-center gap-2">
            <Calendar size={24} /> {t.misc.archive}
          </h1>
        </div>

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && dates.length === 0 && (
          <div className="py-20 text-center text-text-secondary">
            <p className="text-3xl mb-2">📭</p>
            <p>{t.digest.noArticles}</p>
          </div>
        )}

        {dates.map((date) => {
          const info = index?.[date];
          const total = info?.total_articles || 0;
          const cats = info?.categories || {};

          return (
            <Link
              key={date}
              href={`/digest/${date}`}
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700
                hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm
                bg-white dark:bg-card-dark transition-all mb-3 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-text-primary dark:text-text-dark group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    📅 {date}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary dark:text-text-darkSecondary">
                    <span>{total} {lang === "zh" ? "篇文章" : "articles"}</span>
                    {Object.entries(cats).map(([cat, count]) => (
                      <span key={cat} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                        {CATEGORY_EMOJI[cat as Category] || ""} {count}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight size={16} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
