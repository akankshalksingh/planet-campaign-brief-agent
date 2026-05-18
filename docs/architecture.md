# Architecture

The app is built around a reviewable GTM workflow rather than an open-ended chatbot.

1. `app/page.tsx` captures a target account and renders the brief.
2. `app/api/brief/route.ts` validates input and runs the server-side agent.
3. `lib/search.ts` gathers account context through Tavily, DuckDuckGo, or curated fallback snippets.
4. `lib/agent.ts` orchestrates classification, retrieval, generation, evaluation, and final safety flags.
5. `data/planet-verticals.json` stores approved vertical messaging and proof points.
6. `lib/knowledge.ts` retrieves the most relevant vertical documents.
7. `lib/schemas.ts` validates every AI output before returning it to the UI.

Production integrations can replace the search and knowledge modules with Salesforce, Marketo, enrichment APIs, or a managed vector database without changing the UI contract.
