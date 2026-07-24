"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { getLocalizedTitle, getLocalizedSummary, getLocalizedKeyPoints } from "@/lib/api";
import { SOURCE_LABELS } from "@/lib/types";
import type { Article } from "@/lib/types";
import { ScoreBadge } from "@/components/common/ScoreBadge";
import { SourceIcon } from "@/components/common/SourceIcon";
import { CategoryTag } from "@/components/common/CategoryTag";
import { ExternalLink, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface NewsCardProps {
  article: Article;
  showCategory?: boolean;
  index?: number;
}

export function NewsCard({ article, showCategory = true, index = 0 }: NewsCardProps) {
  const { lang, t } = useLanguage();
  const title = getLocalizedTitle(article, lang);
  const summary = getLocalizedSummary(article, lang);
  const keyPoints = getLocalizedKeyPoints(article, lang);

  const timeAgo = (() => {
    try {
      const diff = Date.now() - new Date(article.published_at).getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return t.misc.justNow;
      if (hours < 1) return `${minutes}m ${t.misc.minutesAgo}`;
      if (hours < 24) return `${hours}h ${t.misc.minutesAgo}`;
      return `${Math.floor(hours / 24)}d ${t.misc.minutesAgo}`;
    } catch { return ""; }
  })();

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group border-b border-gray-100 dark:border-gray-800 pb-5"
    >
      <div className="flex items-start gap-3">
        {/* Score badge */}
        <div className="shrink-0 mt-0.5">
          <ScoreBadge score={article.score} size="sm" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta line */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-text-secondary dark:text-text-darkSecondary">
              <SourceIcon type={article.source_type} size={12} />
              <span className="font-medium">{article.source_name}</span>
              <span className="mx-1">·</span>
              <Clock size={10} />
              <span>{timeAgo}</span>
            </div>
            {showCategory && <CategoryTag category={article.category} />}
          </div>

          {/* Title */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-text-primary dark:text-text-dark hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-snug"
          >
            {title || article.title}
          </a>

          {/* Cross-source indicator */}
          {article.cross_sourced_from && article.cross_sourced_from.length > 0 && (
            <span className="ml-2 text-xs text-text-secondary dark:text-text-darkSecondary">
              {t.misc.crossSource}: {article.cross_sourced_from.join(", ")}
            </span>
          )}

          {/* Summary */}
          {summary && (
            <p className="mt-1 text-sm text-text-secondary dark:text-text-darkSecondary leading-relaxed line-clamp-3">
              {summary}
            </p>
          )}

          {/* Key points */}
          {keyPoints.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {keyPoints.map((kp, i) => (
                <li key={i} className="text-xs text-text-secondary dark:text-text-darkSecondary flex items-start gap-1.5">
                  <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
                  {kp}
                </li>
              ))}
            </ul>
          )}

          {/* Thumbnail for YouTube */}
          {article.source_type === "youtube" && article.thumbnail_url && (
            <div className="mt-2 relative rounded-lg overflow-hidden aspect-video max-w-sm">
              <img
                src={article.thumbnail_url}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[7px] border-y-transparent ml-0.5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* External link */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1.5 rounded-lg text-text-secondary dark:text-text-darkSecondary opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </motion.article>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}
