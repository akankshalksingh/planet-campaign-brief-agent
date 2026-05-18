# Planet Campaign Brief Generator

From account signal to campaign brief in minutes.

This is a production-oriented Next.js implementation of the Planet GTM campaign brief workflow. It takes a target company, gathers company context, detects the best-fit Planet vertical, retrieves approved Planet messaging, generates a structured campaign brief with Gemini, evaluates output quality, and presents a human-reviewable result.

## Why this version is Vercel-ready

- Next.js App Router UI and serverless API route
- Gemini API calls through `fetch`, with JSON-only prompts and Zod validation
- Serverless-friendly RAG layer backed by an approved local vertical knowledge base
- Optional Tavily live search, DuckDuckGo fallback, and conservative curated fallbacks
- Evidence panel, risk flags, eval scores, and structured JSON output
- Human review gating for weak search, low eval scores, and sensitive verticals

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required:

```bash
GEMINI_API_KEY=your_key
```

Optional:

```bash
TAVILY_API_KEY=your_key
```

Open `http://localhost:3000`.

## Deploy to Vercel

```bash
npm run build
npx vercel
```

Set `GEMINI_API_KEY` in the Vercel project environment variables. Add `TAVILY_API_KEY` if you want stronger live web research.

## Architecture

```text
Company name
  -> live/fallback company search
  -> Gemini vertical detection
  -> approved Planet vertical retrieval
  -> Gemini campaign brief generation
  -> Gemini evaluation
  -> evidence, risk, score, and JSON UI
```

The original brief proposed Python and ChromaDB. For Vercel, this implementation keeps the same architecture but uses a typed local knowledge base and lightweight retrieval so deployment is reliable in serverless environments.
