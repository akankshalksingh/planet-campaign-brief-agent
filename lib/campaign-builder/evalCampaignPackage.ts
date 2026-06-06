import { CampaignBuilderInput, CampaignBuilderOutput } from "@/lib/campaign-builder/schemas";

const clamp5 = (value: number) => Math.max(1, Math.min(5, value));

export function evaluateCampaignPackage(
  input: CampaignBuilderInput,
  output: Pick<CampaignBuilderOutput, "campaignSummary" | "channelPlan" | "copyAssets" | "utmLinks" | "attributionReadiness" | "reviewFlags">
): CampaignBuilderOutput["evalScore"] {
  const selectedChannelsWithCopy = [
    input.channels.includes("Email") && output.copyAssets.email.body,
    input.channels.includes("LinkedIn Paid") && output.copyAssets.linkedIn.primaryText,
    input.channels.includes("SDR Follow-up") && output.copyAssets.sdrFollowUp.talkTrack,
    input.channels.includes("Landing Page") && output.copyAssets.landingPage.headline
  ].filter(Boolean).length;

  const vagueIdea = input.campaignIdea.trim().split(/\s+/).length < 3;
  const validUtms = output.utmLinks.length > 0 && output.utmLinks.every((link) => link.validation.status !== "error");

  const scores = {
    accountVerticalRelevance: clamp5(input.targetVertical.includes("Other") ? 2 : 4),
    planetFit: clamp5(vagueIdea ? 3 : 4),
    campaignSpecificity: clamp5(vagueIdea ? 2 : 5),
    channelReadiness: clamp5(output.channelPlan.length >= input.channels.length && selectedChannelsWithCopy > 0 ? 5 : 3),
    attributionReadiness: clamp5(Math.ceil(output.attributionReadiness.score / 20)),
    groundedness: clamp5(output.reviewFlags.length ? 4 : 3),
    actionability: clamp5(output.channelPlan.length && output.copyAssets.landingPage.headline ? 5 : 3),
    humanReviewSafety: clamp5(output.reviewFlags.length ? 5 : 2)
  };

  if (!input.landingPageUrl.trim()) {
    scores.attributionReadiness = 1;
  }

  if (!validUtms) {
    scores.attributionReadiness = Math.min(scores.attributionReadiness, 3);
  }

  const totalScore = Object.values(scores).reduce((total, value) => total + value, 0);
  const status =
    totalScore >= 32
      ? "Strong, ready for human review"
      : totalScore >= 24
        ? "Useful, needs marketing ops review"
        : totalScore >= 16
          ? "Weak, revise before use"
          : "Blocked, not launchable";

  return {
    ...scores,
    totalScore,
    maxScore: 40,
    status,
    notes: [
      validUtms ? "UTM links are available for selected channels." : "UTM validation needs review.",
      output.reviewFlags.length ? "Human review flags are included." : "Add review flags before launch.",
      "Score is deterministic and intended as a pre-launch quality gate."
    ]
  };
}
