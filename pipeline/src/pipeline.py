"""Main pipeline orchestrator — chains all stages together."""
import asyncio
import json
import os
import sys

from deduplicator import Deduplicator
from fetcher import NewsFetcher
from scorer import LLMScorer
from serializer import Serializer
from summarizer import BilingualSummarizer


class Pipeline:
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "config", "sources.json"
            )

        with open(config_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)

        self.api_key = os.environ.get("DEEPSEEK_API_KEY") or os.environ.get("OPENAI_API_KEY", "")
        self.model = os.environ.get("LLM_MODEL", "deepseek-chat")
        self.base_url = os.environ.get("LLM_BASE_URL", "https://api.deepseek.com/v1")
        self.rsshub_url = os.environ.get("RSSHUB_BASE_URL", "https://rsshub.app")
        self.score_threshold = float(os.environ.get("SCORE_THRESHOLD", "5.0"))
        self.max_items = int(os.environ.get("MAX_ITEMS", "80"))
        self.data_dir = os.environ.get("DATA_DIR", "data")

        if not self.api_key:
            print("[WARN] No LLM API key set. Set DEEPSEEK_API_KEY or OPENAI_API_KEY.")
            print("[WARN] Pipeline will run in demo mode (no LLM scoring/summarization).")

    async def run(self):
        print("=" * 60)
        print("  AI Pulse — Daily AI News Pipeline")
        print("=" * 60)
        print(f"  LLM: {self.model} @ {self.base_url}")
        print(f"  RSSHub: {self.rsshub_url}")
        print(f"  Score threshold: {self.score_threshold}")
        print(f"  Max items: {self.max_items}")
        print("=" * 60)

        # Stage 1: Fetch
        fetcher = NewsFetcher(self.config, self.rsshub_url)
        try:
            raw_articles = await fetcher.fetch_all()
        finally:
            await fetcher.close()

        if not raw_articles:
            print("[Pipeline] No articles fetched. Exiting.")
            return

        # Stage 2: Deduplicate
        dedup = Deduplicator()
        articles = dedup.deduplicate(raw_articles)

        # Stage 3-4: Score and Summarize (requires LLM API key)
        if self.api_key:
            scorer = LLMScorer(
                api_key=self.api_key, model=self.model,
                base_url=self.base_url, score_threshold=self.score_threshold,
                max_items=self.max_items,
            )
            articles = scorer.score_articles(articles)

            summarizer = BilingualSummarizer(
                api_key=self.api_key, model=self.model, base_url=self.base_url,
            )
            articles, daily_en, daily_zh = summarizer.summarize(articles)
        else:
            print("[Pipeline] Demo mode: skipping LLM scoring and summarization.")
            for i, a in enumerate(articles[:self.max_items]):
                a.score = 7.0
                a.title_en = a.title
                a.title_zh = a.title
                a.summary_en = f"Article from {a.source_name} about AI."
                a.summary_zh = f"来自 {a.source_name} 的 AI 相关文章。"
            daily_en = "Today's AI news digest."
            daily_zh = "今日 AI 新闻摘要。"

        # Stage 5: Serialize
        serializer = Serializer(data_dir=self.data_dir)
        date_str = serializer.serialize(articles, daily_en, daily_zh)

        print("=" * 60)
        print(f"  ✅ Pipeline completed for {date_str}")
        print(f"  📊 {len(articles)} articles published")
        print("=" * 60)

        return date_str, len(articles)


async def main():
    pipeline = Pipeline()
    await pipeline.run()

if __name__ == "__main__":
    asyncio.run(main())
