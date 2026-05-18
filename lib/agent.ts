import { generateJson, GEMINI_MODEL } from "@/lib/gemini";
import { formatVerticalContext, isPlanetVertical, retrievePlanetContext } from "@/lib/knowledge";
import { briefPrompt, evalPrompt, verticalDetectionPrompt } from "@/lib/prompts";
import { briefCoreSchema, evalSchema, verticalDetectionSchema } from "@/lib/schemas";
import { searchCompany } from "@/lib/search";
import { CampaignBrief, PlanetVerticalName } from "@/lib/types";
import { stringifyForPrompt } from "@/lib/json";

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

  const verticalRaw = await generateJson(verticalDetectionPrompt(companyName, companyContext));
  const verticalDetection = verticalDetectionSchema.parse(verticalRaw);

  const detectedVertical: PlanetVerticalName = isPlanetVertical(verticalDetection.detected_vertical)
    ? verticalDetection.detected_vertical
    : "Government and Civil";

  const retrievedContent = retrievePlanetContext(
    `${companyName} ${companyContext.summary}`,
    detectedVertical
  );
  const retrievedContext = formatVerticalContext(retrievedContent);

  const briefRaw = await generateJson(
    briefPrompt({
      companyName,
      detectedVertical,
      companyContext,
      retrievedContext
    })
  );
  const briefCore = briefCoreSchema.parse({
    ...briefRaw,
    detected_vertical: detectedVertical
  });

  const evalRaw = await generateJson(
    evalPrompt({
      companyContext,
      retrievedContext,
      briefJson: stringifyForPrompt(briefCore)
    })
  );
  const evalScores = evalSchema.parse(evalRaw);

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
      human_review_required: evalScores.flag || companyContext.searchQuality !== "live"
    }
  };

  return enforceReviewLanguage(result);
}
