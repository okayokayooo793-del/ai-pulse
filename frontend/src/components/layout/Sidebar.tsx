"use client";

import { useLanguage } from "@/hooks/useLanguage";
import type { Category, SourceType } from "@/lib/types";
import { CATEGORY_LABELS_EN, CATEGORY_LABELS_ZH, CATEGORY_EMOJI, SOURCE_LABELS } from "@/lib/types";
import { SourceIcon } from "@/components/common/SourceIcon";

interface SidebarProps {
  selectedCategory: string;
  selectedSource: string;
  onCategoryChange: (cat: string) => void;
  onSourceChange: (src: string) => void;
  availableDates?: string[];
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

export function Sidebar({
  selectedCategory, selectedSource,
  onCategoryChange, onSourceChange,
  availableDates, selectedDate, onDateChange,
}: SidebarProps) {
  const { lang, t } = useLanguage();

  const categories: Array<{ value: string; label: string; emoji: string }> = [
    { value: "all", label: t.categories.all, emoji: "📋" },
    { value: "research", label: t.categories.research, emoji: CATEGORY_EMOJI.research },
    { value: "industry", label: t.categories.industry, emoji: CATEGORY_EMOJI.industry },
    { value: "tools", label: t.categories.tools, emoji: CATEGORY_EMOJI.tools },
    { value: "opinion", label: t.categories.opinion, emoji: CATEGORY_EMOJI.opinion },
  ];

  const sourceTypes: Array<SourceType> = ["twitter", "youtube", "rss", "reddit", "hackernews", "github"];

  const btnClass = (active: boolean) =>
    `w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
      active
        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium"
        : "text-text-secondary dark:text-text-darkSecondary hover:bg-gray-50 dark:hover:bg-gray-800"
    }`;

  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-16 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold text-text-secondary dark:text-text-darkSecondary uppercase tracking-wider mb-2 px-3">
            {lang === "zh" ? "分类" : "Categories"}
          </h3>
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={btnClass(selectedCategory === cat.value)}
              >
                <span className="flex items-center gap-2">{cat.emoji} {cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div>
          <h3 className="text-xs font-semibold text-text-secondary dark:text-text-darkSecondary uppercase tracking-wider mb-2 px-3">
            {lang === "zh" ? "来源" : "Sources"}
          </h3>
          <div className="space-y-0.5">
            <button
              key="all"
              onClick={() => onSourceChange("all")}
              className={btnClass(selectedSource === "all")}
            >
              <span className="flex items-center gap-2">📡 {t.sources.all}</span>
            </button>
            {sourceTypes.map((st) => (
              <button
                key={st}
                onClick={() => onSourceChange(st)}
                className={btnClass(selectedSource === st)}
              >
                <span className="flex items-center gap-2">
                  <SourceIcon type={st} size={14} /> {SOURCE_LABELS[st]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Date picker */}
        {availableDates && availableDates.length > 0 && onDateChange && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary dark:text-text-darkSecondary uppercase tracking-wider mb-2 px-3">
              {lang === "zh" ? "日期" : "Date"}
            </h3>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {availableDates.map((d) => (
                <button
                  key={d}
                  onClick={() => onDateChange(d)}
                  className={btnClass(selectedDate === d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
