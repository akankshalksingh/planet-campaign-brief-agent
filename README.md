# GTM Intelligence Studio

> **Demo Data Disclaimer**
> This project is a demonstration built entirely with fictional companies, mock account signals, sample campaign content, and simulated performance data. No information shown in this application was obtained from any company, employer, customer, CRM, marketing platform, or private database. The application is not connected to live systems and does not represent the actual strategy, customers, campaigns, data, or operations of any organization.

From account signals to campaign strategy in minutes.

GTM Intelligence Studio is a production-oriented Next.js application that demonstrates an AI-assisted go-to-market workflow.

The application takes a target account or engagement signal, gathers relevant company context, evaluates account fit and intent, retrieves approved messaging from a configurable knowledge base, generates a structured campaign strategy using Gemini, evaluates output quality, and presents the result for human review.

The workflow is designed to help GTM teams move from signal discovery to campaign planning, asset creation, ownership, and measurement without relying on company-specific data.

## Core workflow

```text
Account signal
  -> company research
  -> industry and account-fit classification
  -> approved knowledge retrieval
  -> campaign strategy generation
  -> output evaluation
  -> evidence, risks, scores, and human review
```

## Why this version is Vercel-ready

* Next.js App Router interface and serverless API routes
* Gemini API requests through `fetch`
* JSON-only LLM prompts with Zod validation
* Serverless-friendly retrieval using a configurable local knowledge base
* Optional Tavily live search with conservative fallback logic
* Evidence panels, confidence scores, risk flags, and structured JSON output
* Human-review gating for weak evidence, low evaluation scores, and uncertain classifications
* Fictional demo data that can be safely replaced with an organization’s approved data sources

## Current capabilities

* Review mock account and engagement signals
* Research company and industry context
* Evaluate account fit and observed intent
* Generate multiple campaign ideas
* Create channel-specific campaign assets
* Assign suggested owners and next actions
* Evaluate generated content for quality and safety
* Display simulated campaign-performance reporting
* Preserve human review before any external action

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

Open:

```text
http://localhost:3000
```

## Deploy to Vercel

```bash
npm run build
npx vercel
```

Add the following environment variable to the Vercel project:

```bash
GEMINI_API_KEY=your_key
```

Optionally add:

```bash
TAVILY_API_KEY=your_key
```

The Tavily key enables stronger live web research. Without it, the application uses its configured fallback research flow.

## Architecture

```text
Account or signal input
  -> live or fallback company research
  -> industry and account-fit classification
  -> approved knowledge-base retrieval
  -> Gemini campaign-strategy generation
  -> Gemini or rule-based evaluation
  -> evidence, risks, confidence scores, and structured output
  -> human review
```

## Retrieval approach

The original prototype used Python and ChromaDB.

For the Vercel deployment, the application preserves the same retrieval and grounding principles while using a typed local knowledge base and lightweight retrieval logic.

This approach is better suited to serverless deployment because it:

* avoids maintaining a persistent local vector database
* keeps approved messaging easy to inspect and update
* reduces deployment complexity
* supports predictable retrieval behavior
* allows the application to remain portable

The local retrieval layer can later be replaced with a production vector database such as Pinecone, Weaviate, ChromaDB, or PostgreSQL with `pgvector`.

## Human-review model

The application generates recommendations and draft content. It does not automatically publish campaigns, contact prospects, update a CRM, or make final targeting decisions.

Outputs may be flagged for review when:

* evidence is limited
* account classification is uncertain
* required fields are missing
* generated claims are unsupported
* confidence or evaluation scores are below the configured threshold
* an account does not clearly match a supported industry or use case

Generated content should always be reviewed before it is used externally.

## Demo limitations

The current application uses fictional and simulated data for demonstration purposes.

It is not currently connected to:

* a live CRM
* a marketing automation platform
* an advertising platform
* a customer database
* product analytics
* an event-tracking system
* a production data warehouse

Any Salesforce, marketing automation, paid-media, reporting, or sales handoff shown in the application represents a proposed workflow rather than a completed live integration.

## Customization

The application can be adapted for another organization by replacing the default configuration for:

* organization name
* products and capabilities
* target industries
* ideal customer profile rules
* buyer personas
* approved messaging
* proof points
* calls to action
* campaign channels
* qualification thresholds
* evaluation criteria
* disqualification and manual-review rules

Company-specific information should remain inside the configuration and knowledge-base layers rather than being hardcoded into UI components or prompts.
