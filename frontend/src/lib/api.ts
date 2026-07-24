/** Data fetching layer. Tries local static files first, then GitHub Raw as fallback. */
import type { DailyDigest, DigestIndex } from "./types";

// Local static path (served from public/data/)
const LOCAL_BASE = "/data";
// GitHub Raw as remote fallback
const GITHUB_RAW = "https://raw.githubusercontent.com/okayokayooo793-del/ai-pulse/master/data";

async function fetchJSON<T>(path: string): Promise<T | null> {
  // Try local first (data bundled with the site)
  try {
    const res = await fetch(`${LOCAL_BASE}/${path}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) return (await res.json()) as T;
  } catch { /* fall through to remote */ }

  // Fallback: GitHub Raw (for runtime updates without redeploy)
  try {
    const res = await fetch(`${GITHUB_RAW}/${path}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) return (await res.json()) as T;
  } catch { /* fall through */ }

  return null;
}

export async function fetchIndex(): Promise<DigestIndex> {
  const data = await fetchJSON<DigestIndex>("index.json");
  return data || {};
}

export async function fetchDailyDigest(date: string): Promise<DailyDigest | null> {
  return fetchJSON<DailyDigest>(`${date}/articles.json`);
}

export async function fetchLatestDigest(): Promise<DailyDigest | null> {
  const index = await fetchIndex();
  const dates = Object.keys(index).sort().reverse();
  if (dates.length === 0) return null;
  return fetchDailyDigest(dates[0]);
}

export async function fetchSearchIndex(): Promise<any[]> {
  const data = await fetchJSON<any[]>("search-index.json");
  return data || [];
}

export function getArticleUrl(article: { source_type: string; url: string }): string {
  return article.url;
}

export function getLocalizedTitle(
  article: { title_en?: string; title_zh?: string; title: string },
  lang: "en" | "zh"
): string {
  if (lang === "zh" && article.title_zh) return article.title_zh;
  if (lang === "en" && article.title_en) return article.title_en;
  return article.title;
}

export function getLocalizedSummary(
  article: { summary_en?: string; summary_zh?: string },
  lang: "en" | "zh"
): string {
  if (lang === "zh" && article.summary_zh) return article.summary_zh;
  if (lang === "en" && article.summary_en) return article.summary_en;
  return "";
}

export function getLocalizedObservation(digest: DailyDigest, lang: "en" | "zh"): string {
  return lang === "zh" ? digest.daily_observation_zh : digest.daily_observation_en;
}

export function getLocalizedKeyPoints(
  article: { key_points_en?: string[]; key_points_zh?: string[] },
  lang: "en" | "zh"
): string[] {
  if (lang === "zh" && article.key_points_zh?.length) return article.key_points_zh;
  if (lang === "en" && article.key_points_en?.length) return article.key_points_en;
  return [];
}
