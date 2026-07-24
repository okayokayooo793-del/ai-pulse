"""Article deduplication using URL normalization and title similarity."""
import re
from difflib import SequenceMatcher
from urllib.parse import urlparse, urlunparse


class Deduplicator:
    def __init__(self, title_similarity_threshold: float = 0.85):
        self.threshold = title_similarity_threshold

    def _normalize_url(self, url: str) -> str:
        """Normalize URL: lowercase host, remove trailing slash, remove utm params."""
        try:
            parsed = urlparse(url)
            netloc = parsed.netloc.lower()
            path = parsed.path.rstrip("/") or "/"

            query_params = []
            if parsed.query:
                for pair in parsed.query.split("&"):
                    if "=" in pair:
                        k, v = pair.split("=", 1)
                        if not k.startswith("utm_") and not k.startswith("ref_"):
                            query_params.append(f"{k}={v}")

            query = "&".join(query_params)
            return urlunparse((parsed.scheme, netloc, path, parsed.params, query, ""))
        except Exception:
            return url

    def _title_similarity(self, t1: str, t2: str) -> float:
        """Compute title similarity using SequenceMatcher."""
        t1_clean = re.sub(r'[^\w\s]', '', t1.lower())
        t2_clean = re.sub(r'[^\w\s]', '', t2.lower())
        return SequenceMatcher(None, t1_clean, t2_clean).ratio()

    def deduplicate(self, articles: list) -> list:
        """Deduplicate articles by URL and title similarity."""
        print("[Pipeline] Stage 2: Deduplicating articles...")

        seen_urls = {}
        deduplicated = []

        for article in articles:
            normalized_url = self._normalize_url(article.url)

            if normalized_url in seen_urls:
                existing = seen_urls[normalized_url]
                existing.cross_sourced_from.append(article.source_name)
                continue

            is_duplicate = False
            for existing in deduplicated:
                similarity = self._title_similarity(article.title, existing.title)
                if similarity >= self.threshold:
                    existing.cross_sourced_from.append(article.source_name)
                    is_duplicate = True
                    break

            if not is_duplicate:
                seen_urls[normalized_url] = article
                deduplicated.append(article)

        dupes_removed = len(articles) - len(deduplicated)
        print(f"  {len(articles)} → {len(deduplicated)} articles ({dupes_removed} duplicates removed)")
        return deduplicated
