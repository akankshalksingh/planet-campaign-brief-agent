import { generateJson, GEMINI_MODEL } from "@/lib/gemini";
import { formatVerticalContext, isPlanetVertical, retrievePlanetContext } from "@/lib/knowledge";
import { briefPrompt, evalPrompt, verticalDetectionPrompt } from "@/lib/prompts";
import { briefCoreSchema, evalSchema, verticalDetectionSchema } from "@/lib/schemas";
import { searchCompany } from "@/lib/search";
import { CampaignBrief, PlanetVerticalName } from "@/lib/types";
import { stringifyForPrompt } from "@/lib/json";

const verticalKeywords: Array<{ vertical: PlanetVerticalName; terms: string[] }> = [
  {
    vertical: "Agriculture",
    terms: ["agriculture", "crop", "farm", "seed", "syngenta", "basf", "xarvio"]
  },
  {
    vertical: "Defense and Intelligence",
    terms: ["defense", "aerospace", "military", "intelligence", "lockheed", "nato", "nga"]
  },
  {
    vertical: "Insurance and Risk",
    terms: ["insurance", "reinsurance", "claims", "risk", "axa", "munich re", "swiss re"]
  },
  {
    vertical: "Environmental and Climate",
    terms: ["climate", "environment", "forest", "biodiversity", "carbon", "vito"]
  },
  {
    vertical: "Maritime",
    terms: ["port", "maritime", "shipping", "vessel", "coast guard", "maersk", "rotterdam"]
  },
  {
    vertical: "Finance and Commodities",
    terms: ["finance", "investment", "asset management", "commodity", "blackrock", "hedge fund"]
  },
  {
    vertical: "Government and Civil",
    terms: ["government", "agency", "disaster", "fema", "noaa", "nasa", "municipal"]
  }
];

function detectVerticalFallback(companyName: string, context: string) {
  const haystack = `${companyName} ${context}`.toLowerCase();
  const scored = verticalKeywords
    .map((item) => ({
      vertical: item.vertical,
      score: item.terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0)
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const second = scored[1];

  return {
    detected_vertical: best?.score ? best.vertical : "Government and Civil",
    confidence: best?.score ? Math.min(8, 4 + best.score) : 3,
    reasoning:
      best?.score
        ? "Fallback keyword classification based on the available company context."
        : "Fallback classification used because model classification was unavailable and the account context was ambiguous.",
    possible_secondary_vertical: second?.score ? second.vertical : null
  };
}

function fallbackBriefCore(params: {
  companyName: string;
  detectedVertical: PlanetVerticalName;
  companyContext: string;
  retrievedContext: ReturnType<typeof retrievePlanetContext>;
}) {
  const primaryContext = params.retrievedContext[0];

  return briefCoreSchema.parse({
    company_name: params.companyName,
    detected_vertical: params.detectedVertical,
    company_overview:
      params.companyContext.split("\n")[0] ??
      `${params.companyName} needs manual review because live company context was limited.`,
    planet_use_case: primaryContext.how_planet_helps,
    planet_fit_score: params.companyContext.toLowerCase().includes("ambiguous") ? 5 : 7,
    fit_rationale: `${params.companyName} maps to Planet's ${params.detectedVertical} motion because the available context aligns with this vertical's core pain: ${primaryContext.customer_pain}`,
    campaign_angle: primaryContext.messaging_angle,
    suggested_next_action: `Route to the ${params.detectedVertical} GTM owner for human review, validate account facts, and shape a campaign around ${primaryContext.kpis.slice(0, 3).join(", ")}.`,
    risks_or_flags:
      "Generated with a conservative fallback path. Validate all company-specific facts and relationship status before using externally."
  });
}

function fallbackEval() {
  return evalSchema.parse({
    relevance: 3,
    specificity: 3,
    groundedness: 3,
    actionability: 3,
    total: 12,
    flag: true,
    eval_notes:
      "Fallback evaluation used because the model evaluator was unavailable. Treat this as a draft for human review."
  });
}

function enforceReviewLanguage(value: CampaignBrief) {
  const sensitive = value.detected_vertical === "Defense and Intelligence" || value.detected_vertical === "Government and Civil";
  const risks = [value.risks_or_flags];

  if (sensitive && !value.risks_or_flags.toLowerCase().includes("human")) {
    risks.push("Keep this brief in human review and restrict claims to public, non-sensitive capabilities.");
  }

  if (value.metadata.search_quality !== "live") {
    risks.push("Live search context was limited; validate company facts before using in an external workflow.");
  }

  return {
    ...value,
    risks_or_flags: Array.from(new Set(risks)).join(" ")
  };
}

export async function runCampaignBriefAgent(companyName: string): Promise<CampaignBrief> {
  const companyContext = await searchCompany(companyName);

  let modelWarning = "";
  let verticalDetection;

  try {
    const verticalRaw = await generateJson(verticalDetectionPrompt(companyName, companyContext));
    verticalDetection = verticalDetectionSchema.parse(verticalRaw);
  } catch (error) {
    modelWarning = error instanceof Error ? error.message : "Model classification was unavailable.";
    verticalDetection = detectVerticalFallback(companyName, companyContext.summary);
  }

  const detectedVertical: PlanetVerticalName = isPlanetVertical(verticalDetection.detected_vertical)
    ? verticalDetection.detected_vertical
    : "Government and Civil";

  const retrievedContent = retrievePlanetContext(
    `${companyName} ${companyContext.summary}`,
    detectedVertical
  );
  const retrievedContext = formatVerticalContext(retrievedContent);

  let briefCore;

  try {
    const briefRaw = await generateJson(
      briefPrompt({
        companyName,
        detectedVertical,
        companyContext,
        retrievedContext
      })
    );
    briefCore = briefCoreSchema.parse({
      ...briefRaw,
      detected_vertical: detectedVertical
    });
  } catch (error) {
    modelWarning = error instanceof Error ? error.message : "Model brief generation was unavailable.";
    briefCore = fallbackBriefCore({
      companyName,
      detectedVertical,
      companyContext: companyContext.summary,
      retrievedContext: retrievedContent
    });
  }

  let evalScores;

  try {
    const evalRaw = await generateJson(
      evalPrompt({
        companyContext,
        retrievedContext,
        briefJson: stringifyForPrompt(briefCore)
      })
    );
    evalScores = evalSchema.parse(evalRaw);
  } catch {
    evalScores = fallbackEval();
  }

  const result: CampaignBrief = {
    ...briefCore,
    eval_scores: evalScores,
    vertical_detection: verticalDetection,
    evidence: {
      company_context: companyContext.snippets,
      retrieved_planet_content: retrievedContent
    },
    metadata: {
      model: GEMINI_MODEL,
      search_quality: companyContext.searchQuality,
      generated_at: new Date().toISOString(),
      human_review_required: Boolean(modelWarning) || evalScores.flag || companyContext.searchQuality !== "live"
    }
  };

  const reviewedResult = enforceReviewLanguage(result);

  if (!modelWarning) return reviewedResult;

  return {
    ...reviewedResult,
    risks_or_flags: `${reviewedResult.risks_or_flags} System note: ${modelWarning}`
  };
}
