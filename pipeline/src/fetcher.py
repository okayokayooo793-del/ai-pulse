"""Async RSS/API fetcher for multiple news sources."""
import asyncio
import hashlib
import json
import os
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone, timedelta
from typing import Optional
from urllib.parse import urljoin

import feedparser
import httpx

# Add pipeline/src to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.prompts import SCORING_PROMPT, SUMMARIZE_EN_PROMPT, SUMMARIZE_ZH_PROMPT


@dataclass
class Article:
    id: str
    title: str
    title_en: str = ""
    title_zh: str = ""
    summary_en: str = ""
    summary_zh: str = ""
    url: str = ""
    source_type: str = "rss"
    source_name: str = ""
    category: str = "industry"
    score: float = 0.0
    technical_depth: float = 0.0
    ai_relevance: float = 0.0
    novelty: float = 0.0
    published_at: str = ""
    thumbnail_url: str = ""
    authors: list = field(default_factory=list)
    key_points_en: list = field(default_factory=list)
    key_points_zh: list = field(default_factory=list)
    cross_sourced_from: list = field(default_factory=list)

    def to_dict(self):
        return asdict(self)


class NewsFetcher:
    def __init__(self, sources_config: dict, rsshub_base_url: str = "https://rsshub.app"):
        self.sources = sources_config
        self.rsshub_base_url = rsshub_base_url.rstrip("/")
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": "AI-Pulse-NewsBot/1.0"},
            follow_redirects=True
        )
        self.beijing_tz = timezone(timedelta(hours=8))

    def _make_id(self, url: str, title: str) -> str:
        content = f"{url}:{title}".encode("utf-8")
        return hashlib.md5(content).hexdigest()[:12]

    def _parse_date(self, entry) -> str:
        struct = getattr(entry, "published_parsed", None) or getattr(entry, "updated_parsed", None)
        if struct:
            try:
                from time import mktime
                dt = datetime.fromtimestamp(mktime(struct), tz=self.beijing_tz)
                return dt.isoformat()
            except Exception:
                pass
        return datetime.now(tz=self.beijing_tz).isoformat()

    async def fetch_rss(self, feed_info: dict) -> list[Article]:
        articles = []
        try:
            resp = await self.client.get(feed_info["url"])
            feed = feedparser.parse(resp.text)
            for entry in feed.entries[:20]:
                url = getattr(entry, "link", "")
                title = getattr(entry, "title", "Untitled").strip()
                if not url:
                    continue
                article = Article(
                    id=self._make_id(url, title),
                    title=title,
                    url=url,
                    source_type="rss",
                    source_name=feed_info["name"],
                    category=feed_info.get("category", "industry"),
                    published_at=self._parse_date(entry),
                )
                articles.append(article)
        except Exception as e:
            print(f"  [WARN] Failed to fetch RSS {feed_info['name']}: {e}")
        return articles

    async def fetch_rsshub_twitter(self, account: dict) -> list[Article]:
        articles = []
        try:
            route = f"/twitter/user/{account['handle']}"
            url = f"{self.rsshub_base_url}{route}"
            resp = await self.client.get(url)
            feed = feedparser.parse(resp.text)
            for entry in feed.entries[:15]:
                title = getattr(entry, "title", "").strip()
                link = getattr(entry, "link", "")
                if not link:
                    continue
                author_match = re.match(r'^@?(\w+)', title)
                actual_title = title
                if author_match:
                    remaining = title[len(author_match.group(0)):].strip(": ：")
                    actual_title = remaining if remaining else title

                article = Article(
                    id=self._make_id(link, actual_title),
                    title=actual_title,
                    url=link,
                    source_type="twitter",
                    source_name=f"@{account['handle']}",
                    category=account.get("category", "industry"),
                    published_at=self._parse_date(entry),
                )
                articles.append(article)
        except Exception as e:
            print(f"  [WARN] Failed to fetch Twitter @{account['handle']}: {e}")
        return articles

    async def fetch_rsshub_youtube(self, channel: dict) -> list[Article]:
        articles = []
        try:
            route = f"/youtube/channel/{channel['channel_id']}"
            url = f"{self.rsshub_base_url}{route}"
            resp = await self.client.get(url)
            feed = feedparser.parse(resp.text)
            for entry in feed.entries[:10]:
                title = getattr(entry, "title", "").strip()
                link = getattr(entry, "link", "")
                if not title or not link:
                    continue
                thumbnail = ""
                if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
                    thumbnail = entry.media_thumbnail[0].get("url", "")
                elif hasattr(entry, "media_content") and entry.media_content:
                    thumbnail = entry.media_content[0].get("url", "")

                article = Article(
                    id=self._make_id(link, title),
                    title=title,
                    url=link,
                    source_type="youtube",
                    source_name=channel["name"],
                    category=channel.get("category", "research"),
                    published_at=self._parse_date(entry),
                    thumbnail_url=thumbnail,
                )
                articles.append(article)
        except Exception as e:
            print(f"  [WARN] Failed to fetch YouTube {channel['name']}: {e}")
        return articles

    async def fetch_reddit(self, sub: dict) -> list[Article]:
        articles = []
        try:
            url = f"https://www.reddit.com/r/{sub['name']}/hot.json?limit=25"
            resp = await self.client.get(url)
            data = resp.json()
            for child in data.get("data", {}).get("children", []):
                post = child["data"]
                ups = post.get("ups", 0)
                if ups < sub.get("min_upvotes", 20):
                    continue
                article = Article(
                    id=self._make_id(f"https://reddit.com{post.get('permalink','')}", post.get("title", "")),
                    title=post.get("title", ""),
                    url=f"https://reddit.com{post.get('permalink', '')}",
                    source_type="reddit",
                    source_name=f"r/{sub['name']}",
                    category=sub.get("category", "industry"),
                    published_at=datetime.fromtimestamp(post.get("created_utc", 0), tz=self.beijing_tz).isoformat(),
                    authors=[post.get("author", "unknown")],
                )
                articles.append(article)
        except Exception as e:
            print(f"  [WARN] Failed to fetch Reddit r/{sub['name']}: {e}")
        return articles

    async def fetch_hackernews(self, config: dict) -> list[Article]:
        articles = []
        try:
            ids_resp = await self.client.get("https://hacker-news.firebaseio.com/v0/topstories.json")
            top_ids = ids_resp.json()[:config.get("max_items", 30)]

            async def fetch_item(item_id):
                try:
                    r = await self.client.get(f"https://hacker-news.firebaseio.com/v0/item/{item_id}.json")
                    return r.json()
                except Exception:
                    return None

            tasks = [fetch_item(iid) for iid in top_ids]
            items = await asyncio.gather(*tasks)

            for item in items:
                if not item or item.get("type") != "story":
                    continue
                score = item.get("score", 0)
                if score < config.get("min_score", 30):
                    continue
                article = Article(
                    id=self._make_id(f"https://news.ycombinator.com/item?id={item.get('id')}", item.get("title", "")),
                    title=item.get("title", ""),
                    url=item.get("url", f"https://news.ycombinator.com/item?id={item.get('id')}"),
                    source_type="hackernews",
                    source_name="Hacker News",
                    category="industry",
                    score=min(score / 100, 10.0),
                    published_at=datetime.fromtimestamp(item.get("time", 0), tz=self.beijing_tz).isoformat(),
                    authors=[item.get("by", "unknown")],
                )
                articles.append(article)
        except Exception as e:
            print(f"  [WARN] Failed to fetch Hacker News: {e}")
        return articles

    async def fetch_github_trending(self, config: dict) -> list[Article]:
        articles = []
        try:
            since_map = {"daily": "daily", "weekly": "weekly", "monthly": "monthly"}
            since = since_map.get(config.get("since", "daily"), "daily")
            for lang in config.get("languages", ["python"]):
                try:
                    url = f"https://raw.githubusercontent.com/trending/{lang}?since={since}"
                    resp = await self.client.get(f"https://github.com/trending/{lang}?since={since}")
                    text = resp.text

                    repo_pattern = re.findall(r'<h2[^>]*>\s*<a[^>]*href="(/[^"]+)"[^>]*>([^<]+)</a>\s*</h2>', text)
                    desc_pattern = re.findall(r'<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([^<]+)</p>', text)

                    for i, (path, name) in enumerate(repo_pattern[:5]):
                        full_path = path.strip()
                        repo_name = name.strip()
                        desc = desc_pattern[i].strip() if i < len(desc_pattern) else ""
                        title = f"{repo_name}: {desc}" if desc else repo_name
                        article = Article(
                            id=self._make_id(f"https://github.com{full_path}", title),
                            title=title,
                            url=f"https://github.com{full_path}",
                            source_type="github",
                            source_name="GitHub Trending",
                            category="tools",
                            published_at=datetime.now(tz=self.beijing_tz).isoformat(),
                        )
                        articles.append(article)
                except Exception as e:
                    print(f"  [WARN] Failed to fetch GitHub trending {lang}: {e}")
        except Exception as e:
            print(f"  [WARN] Failed to fetch GitHub trending: {e}")
        return articles

    async def fetch_all(self) -> list[Article]:
        print("[Pipeline] Stage 1: Fetching all sources...")
        all_articles = []
        tasks = []

        rss_feeds = self.sources.get("rss_feeds", [])
        for feed in rss_feeds:
            tasks.append(self.fetch_rss(feed))

        rsshub = self.sources.get("rsshub_sources", {})
        for account in rsshub.get("twitter_accounts", []):
            tasks.append(self.fetch_rsshub_twitter(account))
        for channel in rsshub.get("youtube_channels", []):
            tasks.append(self.fetch_rsshub_youtube(channel))

        for sub in self.sources.get("reddit_subs", []):
            tasks.append(self.fetch_reddit(sub))

        hn_config = self.sources.get("hackernews", {})
        if hn_config.get("enabled"):
            tasks.append(self.fetch_hackernews(hn_config))

        gh_config = self.sources.get("github_trending", {})
        if gh_config.get("enabled"):
            tasks.append(self.fetch_github_trending(gh_config))

        results = await asyncio.gather(*tasks)
        for result in results:
            all_articles.extend(result)

        print(f"  Fetched {len(all_articles)} raw articles from {len(tasks)} sources")
        return all_articles

    async def close(self):
        await self.client.aclose()
