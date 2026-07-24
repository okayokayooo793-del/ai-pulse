"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchSearchIndex } from "@/lib/api";

interface SearchResult {
  id: string;
  date: string;
  title_en: string;
  title_zh: string;
  source_type: string;
  source_name: string;
  category: string;
  score: number;
  url: string;
  text: string;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const indexRef = useRef<SearchResult[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    fetchSearchIndex().then((data) => {
      if (data) indexRef.current = data;
    });
  }, []);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);

    // Simple client-side search
    const found = indexRef.current.filter((item) => {
      const text = item.text.toLowerCase();
      return terms.every((term) => text.includes(term));
    });

    // Sort by score
    found.sort((a, b) => b.score - a.score);
    setResults(found.slice(0, 50));
    setLoading(false);
  }, []);

  return { query, results, loading, search, setQuery };
}
