import { CompanyContext, PlanetVerticalName } from "@/lib/types";

export function verticalDetectionPrompt(companyName: string, companyContext: CompanyContext) {
  return `You are a GTM intelligence analyst for Planet.

Classify the target company into exactly one of Planet's seven GTM verticals:
1. Agriculture
2. Defense and Intelligence
3. Insurance and Risk
4. Environmental and Climate
5. Maritime
6. Finance and Commodities
7. Government and Civil

Use only the provided company context. Do not invent facts.

Company name:
${companyName}

Company context:
${companyContext.summary}

Search snippets:
${companyContext.snippets.map((item, index) => `${index + 1}. ${item.title}: ${item.snippet}`).join("\n")}

Return JSON only:
{
  "detected_vertical": "one of the seven verticals",
  "confidence": 1-10,
  "reasoning": "short explanation based only on supplied context",
  "possible_secondary_vertical": "optional secondary vertical or null"
}`;
}

export function briefPrompt(params: {
  companyName: string;
  detectedVertical: PlanetVerticalName;
  companyContext: CompanyContext;
  retrievedContext: string;
}) {
  return `You are a senior growth marketing strategist at Planet.

Create a campaign brief for the target company using:
1. Real company context from search
2. Retrieved Planet vertical content from the approved knowledge base

Rules:
- Use only the company context and retrieved Planet content.
- Do not invent partnerships, product usage, contracts, customer relationships, or recent news.
- If something is uncertain, put it in risks_or_flags.
- Keep the tone sharp, useful, and sales-ready.
- Return valid JSON only.
- The output must be specific enough for a growth marketer or sales rep to use.
- Defense and intelligence outputs must stay public, non-sensitive, and human-review oriented.

Company name:
${params.companyName}

Detected vertical:
${params.detectedVertical}

Company context:
${params.companyContext.summary}

Search snippets:
${params.companyContext.snippets.map((item, index) => `${index + 1}. ${item.title}: ${item.snippet}`).join("\n")}

Retrieved Planet content:
${params.retrievedContext}

Return exactly this JSON structure:
{
  "company_name": "",
  "detected_vertical": "",
  "company_overview": "2-3 sentence summary from search context, real facts only",
  "planet_use_case": "",
  "planet_fit_score": 1-10,
  "fit_rationale": "",
  "campaign_angle": "",
  "suggested_next_action": "",
  "risks_or_flags": ""
}`;
}

export function evalPrompt(params: {
  companyContext: CompanyContext;
  retrievedContext: string;
  briefJson: string;
}) {
  return `You are an AI quality evaluator for Planet's marketing AI system.

Evaluate the campaign brief below across four dimensions:
1. Relevance: Does the Planet use case match the company's actual industry and needs?
2. Specificity: Is the brief clearly about this company, not generic?
3. Groundedness: Are claims supported by the company context or retrieved Planet content?
4. Actionability: Can a marketer or sales rep use the recommendation?

Scoring:
- 1 = poor
- 2 = weak
- 3 = acceptable
- 4 = strong
- 5 = excellent

Flag the output if total score is below 14 or if any individual score is 2 or below.

Company context:
${params.companyContext.summary}

Retrieved Planet content:
${params.retrievedContext}

Generated brief:
${params.briefJson}

Return JSON only:
{
  "relevance": 1-5,
  "specificity": 1-5,
  "groundedness": 1-5,
  "actionability": 1-5,
  "total": 4-20,
  "flag": true,
  "eval_notes": "short explanation of strengths, weaknesses, and what to improve"
}`;
}
