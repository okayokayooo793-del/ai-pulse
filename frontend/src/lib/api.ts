/** Data fetching layer — reads pipeline output from the data/ directory. */
import type { DailyDigest, DigestIndex } from "./types";

const DATA_BASE = process.env.NEXT_PUBLIC_DATA_URL || "/data";

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const url = `${DATA_BASE}/${path}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
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
