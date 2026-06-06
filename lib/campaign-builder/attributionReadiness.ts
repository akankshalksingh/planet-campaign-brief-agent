import readinessRules from "@/data/attribution-readiness-rules.json";
import { CampaignBuilderInput, CampaignBuilderOutput } from "@/lib/campaign-builder/schemas";

type ReadinessRule = {
  id: string;
  label: string;
  weight: number;
};

const rules = readinessRules as ReadinessRule[];

export function calculateAttributionReadiness(
  input: CampaignBuilderInput,
  output: Pick<CampaignBuilderOutput, "campaignSummary" | "channelPlan" | "kpiPlan" | "utmLinks" | "launchChecklist" | "reviewFlags">
): CampaignBuilderOutput["attributionReadiness"] {
  const hasMemberStatuses = output.launchChecklist.some(
    (item) => item.item.toLowerCase().includes("campaign member") && item.status !== "missing"
  );

  const state: Record<string, { passed: boolean; note: string }> = {
    campaign_name: {
      passed: output.campaignSummary.campaignName.trim().length > 0,
      note: "Campaign name is available for ops setup."
    },
    primary_kpi: {
      passed: output.kpiPlan.primaryKpi.trim().length > 0,
      note: "Primary KPI is defined."
    },
    landing_page_url: {
      passed: input.landingPageUrl.trim().length > 0,
      note: input.landingPageUrl.trim() ? "Landing page destination is present." : "Landing page URL is required."
    },
    utm_links: {
      passed: output.utmLinks.length > 0,
      note: `${output.utmLinks.length} UTM link${output.utmLinks.length === 1 ? "" : "s"} generated.`
    },
    utm_valid: {
      passed: output.utmLinks.length > 0 && output.utmLinks.every((link) => link.validation.status !== "error"),
      note: "UTM links are generated and do not contain blocking errors."
    },
    channel_plan: {
      passed: output.channelPlan.length > 0,
      note: "Channel plan is present."
    },
    member_statuses: {
      passed: hasMemberStatuses,
      note: "Campaign member statuses need marketing ops confirmation."
    },
    launch_checklist: {
      passed: output.launchChecklist.length > 0,
      note: "Launch checklist is available."
    },
    review_flags: {
      passed: output.reviewFlags.length > 0,
      note: "Human review flags are visible before activation."
    }
  };

  const checks = rules.map((rule) => ({
    label: rule.label,
    passed: state[rule.id]?.passed ?? false,
    weight: rule.weight,
    note: state[rule.id]?.note ?? "Rule not evaluated."
  }));

  const score = checks.reduce((total, check) => total + (check.passed ? check.weight : 0), 0);
  const warnings = [
    "Salesforce Campaign ID not provided.",
    "Marketo Program ID not provided.",
    "Confirm campaign member statuses before launch."
  ];

  if (input.channels.includes("SDR Follow-up") && !input.campaignOwner.trim()) {
    warnings.push("SDR owner is not assigned.");
  }

  const missingItems = checks.filter((check) => !check.passed).map((check) => check.label);

  return {
    score,
    status: score >= 85 ? "ready" : score >= 60 ? "needs_review" : "blocked",
    checks,
    missingItems,
    warnings
  };
}
