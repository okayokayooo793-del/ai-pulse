/** Shared TypeScript types for AI Pulse. */

export interface Article {
  id: string;
  title: string;
  title_en: string;
  title_zh: string;
  summary_en: string;
  summary_zh: string;
  url: string;
  source_type: "twitter" | "youtube" | "rss" | "reddit" | "hackernews" | "github";
  source_name: string;
  category: "research" | "industry" | "tools" | "opinion";
  score: number;
  technical_depth: number;
  ai_relevance: number;
  novelty: number;
  published_at: string;
  thumbnail_url?: string;
  authors?: string[];
  key_points_en?: string[];
  key_points_zh?: string[];
  cross_sourced_from?: string[];
}

export interface DailyDigest {
  date: string;
  generated_at: string;
  total_articles: number;
  daily_observation_en: string;
  daily_observation_zh: string;
  articles: Article[];
}

export interface DigestIndex {
  [date: string]: {
    date: string;
    total_articles: number;
    categories: Record<string, number>;
  };
}

export type SourceType = Article["source_type"];
export type Category = Article["category"];

export const SOURCE_LABELS: Record<SourceType, string> = {
  twitter: "X / Twitter",
  youtube: "YouTube",
  rss: "RSS",
  reddit: "Reddit",
  hackernews: "Hacker News",
  github: "GitHub",
};

export const CATEGORY_LABELS_EN: Record<Category, string> = {
  research: "Research",
  industry: "Industry",
  tools: "Tools & OSS",
  opinion: "Opinion",
};

export const CATEGORY_LABELS_ZH: Record<Category, string> = {
  research: "研究",
  industry: "产业",
  tools: "工具 & 开源",
  opinion: "观点",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  research: "🔬",
  industry: "🏭",
  tools: "🛠️",
  opinion: "💭",
};

export const SOURCE_COLORS: Record<SourceType, string> = {
  twitter: "bg-blue-500",
  youtube: "bg-red-500",
  rss: "bg-orange-500",
  reddit: "bg-red-600",
  hackernews: "bg-orange-600",
  github: "bg-purple-700",
};
