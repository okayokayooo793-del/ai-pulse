"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { getLocalizedObservation } from "@/lib/api";
import type { DailyDigest, Article } from "@/lib/types";
import { NewsCard } from "@/components/cards/NewsCard";
import { motion } from "framer-motion";

interface DailyBriefProps {
  digest: DailyDigest;
}

export function DailyBrief({ digest }: DailyBriefProps) {
  const { lang, t } = useLanguage();
  const observation = getLocalizedObservation(digest, lang);
  const topStories = [...digest.articles].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Observation */}
      {observation && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30
            rounded-xl p-4 border border-indigo-100 dark:border-indigo-900"
        >
          <h2 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
            {t.digest.dailyObservation}
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-darkSecondary leading-relaxed">
            {observation}
          </p>
        </motion.div>
      )}

      {/* Top Stories */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary dark:text-text-dark mb-4">
          🏆 {t.digest.topStories}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topStories.map((article, i) => (
            <TopStoryCard key={article.id} article={article} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function TopStoryCard({ article, index }: { article: Article; index: number }) {
  const { lang } = useLanguage();
  const title = lang === "zh" ? (article.title_zh || article.title) : (article.title_en || article.title);

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700
        bg-white dark:bg-card-dark hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700
        transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-secondary dark:text-text-darkSecondary font-medium">
          {article.source_name}
        </span>
        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
          article.score >= 8 ? "text-green-600 dark:text-green-400" :
          article.score >= 6 ? "text-yellow-600 dark:text-yellow-400" :
          "text-gray-500"
        }`}>
          {article.score.toFixed(1)}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
        {title}
      </h3>
    </motion.a>
  );
}
