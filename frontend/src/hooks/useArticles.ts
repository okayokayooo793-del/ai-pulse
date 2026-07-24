"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDailyDigest, fetchLatestDigest, fetchIndex } from "@/lib/api";
import type { DailyDigest, DigestIndex } from "@/lib/types";

export function useDailyDigest(date?: string) {
  return useQuery<DailyDigest | null>({
    queryKey: ["digest", date],
    queryFn: () => (date ? fetchDailyDigest(date) : fetchLatestDigest()),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useDigestIndex() {
  return useQuery<DigestIndex>({
    queryKey: ["index"],
    queryFn: fetchIndex,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
