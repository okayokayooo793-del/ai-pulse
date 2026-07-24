# 🤖 AI Pulse — Daily AI News Aggregator

A bilingual (EN/中文) AI news aggregator that collects, scores, and summarizes AI news from 40+ sources including X (Twitter), YouTube, blogs, Reddit, Hacker News, and GitHub Trending. Updated daily at 08:00 Beijing time.

## ✨ Features

- 🔍 **40+ Sources**: X/Twitter, YouTube channels, AI blogs, arXiv, Reddit, Hacker News, GitHub Trending
- 🌐 **Bilingual**: Full English and Chinese support — toggle with one click
- 🤖 **AI-Powered**: LLM scoring, deduplication, bilingual summarization
- 📱 **Timeline UI**: Clean newsfeed-style interface with category/source filtering
- 🌙 **Dark Mode**: System-aware with manual toggle
- 📲 **PWA**: Install to home screen, offline access
- ⚡ **One-Click Deploy**: Vercel + GitHub Actions, free tier

## 🏗 Architecture

```
RSSHub (feed generation) → GitHub Actions (daily cron) → Python Pipeline → JSON → Next.js Frontend
```

- **Feed Layer**: RSSHub converts Twitter/X and YouTube to RSS feeds
- **Pipeline**: Python — fetch → deduplicate → LLM score → LLM summarize bilingual → serialize JSON
- **Frontend**: Next.js 15 with Tailwind CSS, TanStack Query, framer-motion
- **Deployment**: Vercel (frontend) + GitHub Actions (pipeline)

## 🚀 Quick Start

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/ai-pulse.git
cd ai-pulse
```

### 2. Set up LLM API Key

Get a free API key from [DeepSeek](https://platform.deepseek.com/api_keys).

```bash
# Create .env file
cp .env.example .env
# Edit .env and add your DEEPSEEK_API_KEY
```

### 3. Install & Run Pipeline

```bash
cd pipeline
pip install -r requirements.txt
python run.py
```

This generates sample data in `data/` directory.

### 4. Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### 5. Set up GitHub Actions (for daily automation)

1. Push to GitHub
2. Go to Settings → Secrets → Actions
3. Add `DEEPSEEK_API_KEY` secret
4. The pipeline runs automatically at 00:00 UTC daily

### 6. Deploy to Vercel

1. Import your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Deploy — done!

## 📂 Project Structure

```
ai-pulse/
├── pipeline/              # Python data pipeline
│   ├── config/            # Sources & LLM prompts
│   ├── src/               # Fetcher, deduplicator, scorer, summarizer, serializer
│   └── run.py             # Entry point
├── frontend/              # Next.js web application
│   └── src/
│       ├── app/           # App Router pages
│       ├── components/    # React components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # API client & types
│       └── locales/       # EN/ZH strings
├── data/                  # Pipeline output (committed by GitHub Actions)
├── .github/workflows/     # Daily cron workflow
└── README.md
```

## ⚙️ Configuration

Edit `pipeline/config/sources.json` to add/remove data sources:

- **rss_feeds**: Standard RSS/Atom feeds
- **rsshub_sources.twitter_accounts**: Twitter/X handles (fetched via RSSHub)
- **rsshub_sources.youtube_channels**: YouTube channel IDs (fetched via RSSHub)
- **reddit_subs**: Subreddit names with min upvote thresholds
- **hackernews**: Configure min score and max items
- **github_trending**: Languages and time range

## 💰 Cost

| Item | Monthly Cost |
|------|-------------|
| DeepSeek API | ~$0.60 |
| GitHub Actions | $0 (public repo) |
| Vercel | $0 (free tier) |
| RSSHub (self-host) | $0-5 |
| **Total** | **$1-6/month** |

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEEPSEEK_API_KEY` | Yes | — | DeepSeek API key |
| `LLM_MODEL` | No | `deepseek-chat` | Model name |
| `LLM_BASE_URL` | No | `https://api.deepseek.com/v1` | API base URL |
| `RSSHUB_BASE_URL` | No | `https://rsshub.app` | RSSHub instance |
| `SCORE_THRESHOLD` | No | `5.0` | Minimum article score |
| `MAX_ITEMS` | No | `80` | Max items to process |

## 📄 License

MIT
