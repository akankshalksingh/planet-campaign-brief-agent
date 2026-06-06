import { CampaignBuilderInput } from "@/lib/campaign-builder/schemas";

export function buildCampaignBuilderPrompt(input: CampaignBuilderInput, context: string, patterns: string) {
  return `You are building a launch-ready campaign package for Planet's GTM team.

Return only valid JSON. Do not include markdown.

Input:
${JSON.stringify(input, null, 2)}

Approved Planet vertical context:
${context}

Curated campaign patterns:
${patterns}

Generate a Campaign Builder V2 package with these keys:
campaignSummary, audienceAndPain, channelPlan, copyAssets, abTestPlan, kpiPlan, reviewFlags, evidenceUsed.

Rules:
- Do not claim Salesforce, Marketo, or any campaign platform has been updated.
- Use cautious, grounded language.
- Make copy assets specific to the selected channels.
- Include human review flags for missing Salesforce/Marketo mapping.
- If the use case is disaster, government, defense, or risk-related, include a high-severity sensitive-use-case review flag.
- Do not include utmLinks, attributionReadiness, launchChecklist, or evalScore. Those are computed deterministically after generation.`;
}
