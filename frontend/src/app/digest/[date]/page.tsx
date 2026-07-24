"use client";

import { use, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useDailyDigest } from "@/hooks/useArticles";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { DailyBrief } from "@/components/digest/DailyBrief";
import { Timeline } from "@/components/timeline/Timeline";
import { NewsCardSkeleton } from "@/components/cards/NewsCard";
import Link from "next/link";

export default function DigestPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);
  const { lang, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");

  const { data: digest, isLoading, error } = useDailyDigest(date);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-8">
          <Sidebar
            selectedCategory={selectedCategory}
            selectedSource={selectedSource}
            onCategoryChange={setSelectedCategory}
            onSourceChange={setSelectedSource}
          />

          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <Link href="/archive" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-1 inline-block">
                ← {t.misc.archive}
              </Link>
              <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark">
                📅 {date}
              </h1>
            </div>

            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            )}

            {error && (
              <div className="py-20 text-center text-red-500">
                <p>{t.digest.error}</p>
              </div>
            )}

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

            {!isLoading && !error && !digest && (
              <div className="py-20 text-center text-text-secondary">
                <p className="text-3xl mb-2">📭</p>
                <p>{t.digest.noArticles}</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
