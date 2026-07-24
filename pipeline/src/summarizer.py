"""Bilingual summarization using LLM."""
import json
import os
import re
import sys

import httpx

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.prompts import SUMMARIZE_EN_PROMPT, SUMMARIZE_ZH_PROMPT, TRANSLATE_TITLES_PROMPT


class BilingualSummarizer:
    def __init__(self, api_key: str, model: str = "deepseek-chat",
                 base_url: str = "https://api.deepseek.com/v1"):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")

    def _call_llm(self, prompt: str, max_tokens: int = 8192) -> dict:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a professional bilingual tech journalist. Always respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.5,
            "max_tokens": max_tokens,
        }

        try:
            resp = httpx.post(
                f"{self.base_url}/chat/completions",
                json=payload,
                headers=headers,
                timeout=180.0,
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]

            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                return json.loads(json_match.group())
            return {}
        except Exception as e:
            print(f"  [ERROR] Summarization LLM call failed: {e}")
            return {}

    def _call_llm_streaming(self, prompt: str, max_tokens: int = 8192) -> str:
        """Call LLM with streaming — useful for very long outputs."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a professional bilingual tech journalist. Always respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.5,
            "max_tokens": max_tokens,
            "stream": True,
        }

        full_content = ""
        try:
            with httpx.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                json=payload,
                headers=headers,
                timeout=180.0,
            ) as resp:
                resp.raise_for_status()
                for line in resp.iter_lines():
                    if line.startswith("data: "):
                        chunk = line[6:]
                        if chunk == "[DONE]":
                            break
                        try:
                            delta = json.loads(chunk)
                            content = delta["choices"][0]["delta"].get("content", "")
                            full_content += content
                        except (json.JSONDecodeError, KeyError, IndexError):
                            pass
        except Exception as e:
            print(f"  [ERROR] Streaming LLM call failed: {e}")
            return ""

        json_match = re.search(r'\{[\s\S]*\}', full_content)
        if json_match:
            return json_match.group()
        return ""

    def _translate_titles(self, articles: list) -> dict:
        """Batch translate titles between EN and ZH."""
        print("  Translating titles...")
        articles_json = json.dumps([
            {"id": i, "title": a.title, "source_type": a.source_type}
            for i, a in enumerate(articles)
        ], ensure_ascii=False, indent=2)

        prompt = TRANSLATE_TITLES_PROMPT.format(articles_json=articles_json)
        result = self._call_llm(prompt, max_tokens=4096)

        trans_map = {}
        for t in result.get("translations", []):
            trans_map[t["id"]] = t
        return trans_map

    def summarize(self, articles: list) -> tuple[list, str, str]:
        """Generate bilingual summaries for all scored articles."""
        print("[Pipeline] Stage 4: Generating bilingual summaries...")

        if not articles:
            return [], "", ""

        articles_json = json.dumps([
            {"id": i, "title": a.title, "url": a.url, "source_name": a.source_name,
             "source_type": a.source_type, "category": a.category, "score": a.score}
            for i, a in enumerate(articles)
        ], ensure_ascii=False, indent=2)

        en_prompt = SUMMARIZE_EN_PROMPT.format(articles_json=articles_json)
        zh_prompt = SUMMARIZE_ZH_PROMPT.format(articles_json=articles_json)

        en_result = self._call_llm(en_prompt, max_tokens=8192) or {}
        zh_result = self._call_llm(zh_prompt, max_tokens=8192) or {}

        en_articles = {a["id"]: a for a in en_result.get("articles", [])}
        zh_articles = {a["id"]: a for a in zh_result.get("articles", [])}

        titles_trans = self._translate_titles(articles)

        for i, article in enumerate(articles):
            en_data = en_articles.get(i, {})
            zh_data = zh_articles.get(i, {})

            article.title_en = en_data.get("title_en", article.title)
            article.title_zh = zh_data.get("title_zh", article.title)
            article.summary_en = en_data.get("summary_en", "")
            article.summary_zh = zh_data.get("summary_zh", "")
            article.key_points_en = en_data.get("key_points_en", [])
            article.key_points_zh = zh_data.get("key_points_zh", [])

            if not article.title_en or not article.title_zh:
                trans = titles_trans.get(i, {})
                if not article.title_en:
                    article.title_en = trans.get("title_en", article.title)
                if not article.title_zh:
                    article.title_zh = trans.get("title_zh", article.title)

        daily_en = en_result.get("daily_observation_en", "")
        daily_zh = zh_result.get("daily_observation_zh", "")

        print(f"  Summarized {len(articles)} articles (EN + ZH)")
        return articles, daily_en, daily_zh
