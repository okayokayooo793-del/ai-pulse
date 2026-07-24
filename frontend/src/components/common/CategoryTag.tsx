"use client";

import type { Category } from "@/lib/types";
import { CATEGORY_LABELS_EN, CATEGORY_LABELS_ZH, CATEGORY_EMOJI } from "@/lib/types";
import { useLanguage } from "@/hooks/useLanguage";

interface CategoryTagProps {
  category: Category;
  onClick?: () => void;
}

export function CategoryTag({ category, onClick }: CategoryTagProps) {
  const { lang } = useLanguage();
  const label = lang === "zh" ? CATEGORY_LABELS_ZH[category] : CATEGORY_LABELS_EN[category];
  const emoji = CATEGORY_EMOJI[category];

  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
        bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300
        ${onClick ? "cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors" : ""}`}
    >
      {emoji} {label}
    </Tag>
  );
}
