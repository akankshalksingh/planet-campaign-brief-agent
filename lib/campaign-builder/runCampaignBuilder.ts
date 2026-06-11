import { z } from "zod";
import { calculateAttributionReadiness } from "@/lib/campaign-builder/attributionReadiness";
import { evaluateCampaignPackage } from "@/lib/campaign-builder/evalCampaignPackage";
import { buildLaunchChecklist } from "@/lib/campaign-builder/launchChecklist";
import { buildMockCampaignPackage } from "@/lib/campaign-builder/mockOutput";
import { buildCampaignBuilderPrompt } from "@/lib/campaign-builder/prompts";
import {
  CampaignBuilderInput,
  CampaignBuilderInputSchema,
  CampaignBuilderOutput,
  CampaignBuilderOutputSchema
} from "@/lib/campaign-builder/schemas";
import { generateUtmLinks } from "@/lib/campaign-builder/utm";
import { generateJson } from "@/lib/gemini";
import {
  formatCampaignPatterns,
  formatVerticalContext,
  isPlanetVertical,
  retrieveCampaignIdeaPatterns,
  retrievePlanetContext
} from "@/lib/knowledge";
import { PlanetVerticalName } from "@/lib/types";

const generatedSchema = CampaignBuilderOutputSchema.pick({
  campaignSummary: true,
  audienceAndPain: true,
  channelPlan: true,
  copyAssets: true,
  abTestPlan: true,
  kpiPlan: true,
  reviewFlags: true,
  evidenceUsed: true
});

function normalizeVertical(value: string): PlanetVerticalName {
  const normalized = value.trim().replace("&", "and");
  if (isPlanetVertical(normalized)) return normalized;
  if (/insurance|risk/i.test(normalized)) return "Insurance and Risk";
  if (/infrastructure/i.test(normalized)) return "Other / Adjacent / Manual Review";
  return isPlanetVertical(value) ? value : "Other / Adjacent / Manual Review";
}

function buildEvidence(input: CampaignBuilderInput): CampaignBuilderOutput["evidenceUsed"] {
  const vertical = normalizeVertical(input.targetVertical);
  const verticalContext = retrievePlanetContext(input.campaignIdea, vertical);
  const patterns = retrieveCampaignIdeaPatterns(input.campaignIdea, [vertical]);

  return {
    verticalContext: verticalContext.map((item) => item.vertical),
    campaignPatterns: patterns.map((item) => item.pattern_name),
    deterministicRules: [
      "Local curated Planet vertical context",
      "Local curated campaign patterns",
      "Deterministic UTM rules",
      "Deterministic attribution readiness rules",
      "Deterministic launch checklist"
    ]
  };
}

function finalizeOutput(input: CampaignBuilderInput, generated: z.infer<typeof generatedSchema>) {
  const campaignName = input.campaignName?.trim() || generated.campaignSummary.campaignName;
  const utmLinks = generateUtmLinks(input, campaignName);
  const launchChecklist = buildLaunchChecklist(input);
  const draft = {
    ...generated,
    campaignSummary: {
      ...generated.campaignSummary,
      campaignName
    },
    utmLinks,
    launchChecklist,
    attributionReadiness: {
      score: 0,
      status: "blocked" as const,
      checks: [],
      missingItems: [],
      warnings: []
    },
    evalScore: {
      accountVerticalRelevance: 1,
      planetFit: 1,
      campaignSpecificity: 1,
      channelReadiness: 1,
      attributionReadiness: 1,
      groundedness: 1,
      actionability: 1,
      humanReviewSafety: 1,
      totalScore: 8,
      maxScore: 40 as const,
      status: "Blocked, not launchable" as const,
      notes: []
    }
  };

  const withReadiness = {
    ...draft,
    attributionReadiness: calculateAttributionReadiness(input, draft)
  };

  return CampaignBuilderOutputSchema.parse({
    ...withReadiness,
    evalScore: evaluateCampaignPackage(input, withReadiness)
  });
}

export async function runCampaignBuilder(rawInput: unknown) {
  const input = CampaignBuilderInputSchema.parse(rawInput);
  const vertical = normalizeVertical(input.targetVertical);
  const verticalContext = retrievePlanetContext(input.campaignIdea, vertical);
  const patterns = retrieveCampaignIdeaPatterns(input.campaignIdea, [vertical]);
  const evidence = buildEvidence(input);

  try {
    const payload = await generateJson(
      buildCampaignBuilderPrompt(input, formatVerticalContext(verticalContext), formatCampaignPatterns(patterns))
    );
    const generated = generatedSchema.parse(payload);
    return {
      data: finalizeOutput(input, {
        ...generated,
        evidenceUsed: {
          ...generated.evidenceUsed,
          verticalContext: evidence.verticalContext,
          campaignPatterns: evidence.campaignPatterns,
          deterministicRules: evidence.deterministicRules
        }
      }),
      fallbackMode: false,
      warning: undefined
    };
  } catch {
    return {
      data: buildMockCampaignPackage(input, evidence),
      fallbackMode: true,
      warning: "Fallback campaign package used. Human review required before launch."
    };
  }
}
