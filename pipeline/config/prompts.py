"""LLM prompt templates for the AI news pipeline."""

SCORING_PROMPT = """You are an AI news curator. Score each article below on a scale of 0-10 based on:
- Technical depth (how substantive is the content?)
- AI relevance (how relevant is this to AI/ML?)
- Novelty (is this new/breaking vs. routine?)

For each article, return ONLY a JSON object with this structure:
{
  "scores": [
    {
      "id": <index>,
      "total_score": <0-10>,
      "technical_depth": <0-10>,
      "ai_relevance": <0-10>,
      "novelty": <0-10>,
      "category": "research|industry|tools|opinion",
      "reasoning": "<1 sentence in English>"
    }
  ]
}

Articles to score:
{articles_json}
"""

SUMMARIZE_EN_PROMPT = """You are a tech journalist writing for an English AI news digest.
For each article below, write:

1. A concise, engaging title in English (max 100 chars)
2. A 2-3 sentence summary in English explaining what happened and why it matters
3. Key takeaways (1-2 bullet points)

Return ONLY a JSON object:
{
  "articles": [
    {
      "id": <index>,
      "title_en": "<title>",
      "summary_en": "<summary>",
      "key_points_en": ["<point1>", "<point2>"]
    }
  ],
  "daily_observation_en": "<one paragraph summarizing today's overall AI news trend>"
}

Articles to summarize:
{articles_json}
"""

SUMMARIZE_ZH_PROMPT = """你是一位科技记者，正在为中文 AI 新闻摘要撰写内容。
对下面的每篇文章，请撰写：

1. 简洁有吸引力的中文标题（最多50字）
2. 2-3句中文摘要，解释发生了什么以及为什么重要
3. 关键要点（1-2条）

只返回一个 JSON 对象：
{
  "articles": [
    {
      "id": <index>,
      "title_zh": "<标题>",
      "summary_zh": "<摘要>",
      "key_points_zh": ["<要点1>", "<要点2>"]
    }
  ],
  "daily_observation_zh": "<一段话总结今天AI新闻的整体趋势>"
}

需要摘要的文章：
{articles_json}
"""

TRANSLATE_TITLES_PROMPT = """Translate the following article titles between English and Chinese.
For each article, provide the translation.

Return ONLY a JSON object:
{
  "translations": [
    {"id": <index>, "title_en": "<English title>", "title_zh": "<Chinese title>"}
  ]
}

Articles:
{articles_json}
"""
