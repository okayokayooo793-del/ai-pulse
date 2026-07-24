"""LLM-based article scoring and filtering."""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.prompts import SCORING_PROMPT


class LLMScorer:
    def __init__(self, api_key: str, model: str = "deepseek-chat",
                 base_url: str = "https://api.deepseek.com/v1",
                 score_threshold: float = 5.0, max_items: int = 80):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.threshold = score_threshold
        self.max_items = max_items

    def _call_llm(self, prompt: str) -> dict:
        """Call LLM API and return parsed JSON response."""
        import httpx

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a precise AI news curator. Always respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "max_tokens": 4096,
        }

        try:
            resp = httpx.post(
                f"{self.base_url}/chat/completions",
                json=payload,
                headers=headers,
                timeout=120.0,
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]

            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                return json.loads(json_match.group())
            return {}
        except Exception as e:
            print(f"  [ERROR] LLM call failed: {e}")
            return {}

    def score_articles(self, articles: list) -> list:
        """Score articles with LLM and filter below threshold."""
        print("[Pipeline] Stage 3: Scoring articles with LLM...")

        if not articles:
            return []

        articles_to_score = articles[:self.max_items]

        articles_json = json.dumps([
            {"id": i, "title": a.title, "source": a.source_name, "source_type": a.source_type}
            for i, a in enumerate(articles_to_score)
        ], ensure_ascii=False, indent=2)

        prompt = SCORING_PROMPT.format(articles_json=articles_json)
        result = self._call_llm(prompt)

        scores_map = {}
        for s in result.get("scores", []):
            scores_map[s["id"]] = s

        scored = []
        for i, article in enumerate(articles_to_score):
            score_data = scores_map.get(i, {})
            total = score_data.get("total_score", 5.0)
            if total >= self.threshold:
                article.score = total
                article.technical_depth = score_data.get("technical_depth", total)
                article.ai_relevance = score_data.get("ai_relevance", total)
                article.novelty = score_data.get("novelty", total)
                article.category = score_data.get("category", article.category)
                scored.append(article)

        scored.sort(key=lambda a: a.score, reverse=True)
        print(f"  {len(articles_to_score)} → {len(scored)} articles (score >= {self.threshold})")
        return scored
