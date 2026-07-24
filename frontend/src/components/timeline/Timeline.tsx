"use client";

import { useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Article, Category, SourceType } from "@/lib/types";
import { CATEGORY_LABELS_EN, CATEGORY_LABELS_ZH, CATEGORY_EMOJI } from "@/lib/types";
import { NewsCard } from "@/components/cards/NewsCard";

interface TimelineProps {
  articles: Article[];
  categoryFilter: string;
  sourceFilter: string;
}

export function Timeline({ articles, categoryFilter, sourceFilter }: TimelineProps) {
  const { lang } = useLanguage();

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (sourceFilter !== "all" && a.source_type !== sourceFilter) return false;
      return true;
    });
  }, [articles, categoryFilter, sourceFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, Article[]> = {};
    for (const article of filtered) {
      const cat = article.category || "industry";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(article);
    }
    return groups;
  }, [filtered]);

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center text-text-secondary dark:text-text-darkSecondary">
        <p className="text-lg">📭</p>
        <p className="mt-2">{lang === "zh" ? "该筛选条件下暂无文章" : "No articles match the current filters"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([cat, catArticles]) => {
        const emoji = CATEGORY_EMOJI[cat as Category] || "📌";
        const label = lang === "zh"
          ? CATEGORY_LABELS_ZH[cat as Category] || cat
          : CATEGORY_LABELS_EN[cat as Category] || cat;

        return (
          <section key={cat}>
            <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary dark:text-text-dark mb-4">
              {emoji} {label}
              <span className="text-sm font-normal text-text-secondary dark:text-text-darkSecondary">
                ({catArticles.length})
              </span>
            </h2>
            <div className="border-l-2 border-indigo-200 dark:border-indigo-900 pl-4 space-y-0">
              {catArticles.map((article, i) => (
                <NewsCard key={article.id} article={article} showCategory={false} index={i} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
