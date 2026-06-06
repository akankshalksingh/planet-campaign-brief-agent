import channelRules from "@/data/channel-rules.json";
import { calculateAttributionReadiness } from "@/lib/campaign-builder/attributionReadiness";
import { evaluateCampaignPackage } from "@/lib/campaign-builder/evalCampaignPackage";
import { buildLaunchChecklist } from "@/lib/campaign-builder/launchChecklist";
import { CampaignBuilderInput, CampaignBuilderOutput } from "@/lib/campaign-builder/schemas";
import { generateUtmLinks } from "@/lib/campaign-builder/utm";

type ChannelRule = {
  channel: string;
  bestFor: string;
  opsNote: string;
};

const channelRuleList = channelRules as ChannelRule[];

const titleCase = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

function buildReviewFlags(input: CampaignBuilderInput): CampaignBuilderOutput["reviewFlags"] {
  const flags: CampaignBuilderOutput["reviewFlags"] = [
    {
      severity: "medium",
      flag: "Salesforce Campaign ID missing",
      recommendation: "Create or map the campaign in Salesforce before launch so member status and attribution are tracked."
    },
    {
      severity: "medium",
      flag: "Marketo Program ID missing",
      recommendation: "Create or map the Marketo program before activating email or nurture assets."
    },
    {
      severity: "medium",
      flag: "Human review required before external outreach",
      recommendation: "Review all generated copy for approved Planet messaging, claim support, and audience fit."
    }
  ];

  if (/defense|surveillance|disaster|wildfire|government|resilience/i.test(input.campaignIdea + " " + input.targetVertical)) {
    flags.push({
      severity: "high",
      flag: "Sensitive use case language",
      recommendation: "Validate public-sector, disaster response, or defense wording with the relevant stakeholder before launch."
    });
  }

  if (input.campaignIdea.trim().split(/\s+/).length < 3) {
    flags.push({
      severity: "high",
      flag: "Campaign idea may be too broad",
      recommendation: "Add a more specific audience, trigger, or decision moment before using external copy."
    });
  }

  return flags;
}

export function buildMockCampaignPackage(
  input: CampaignBuilderInput,
  evidence: CampaignBuilderOutput["evidenceUsed"]
): CampaignBuilderOutput {
  const campaignName = titleCase(input.campaignIdea);
  const audience = input.targetAudience;
  const channelPlan = input.channels.map((channel) => {
    const rule = channelRuleList.find((item) => item.channel === channel);
    return {
      channel,
      role:
        channel === "Landing Page"
          ? "Conversion destination"
          : channel === "SDR Follow-up"
            ? "Account progression"
            : "Message activation",
      recommendedUse: rule?.bestFor ?? "Support the campaign motion with a channel-specific asset.",
      opsNotes: rule?.opsNote ?? "Confirm channel setup before launch.",
      priority: channel === "Landing Page" || channel === "Email" ? "high" as const : "medium" as const
    };
  });

  const launchChecklist = buildLaunchChecklist(input);
  const reviewFlags = buildReviewFlags(input);
  const base = {
    campaignSummary: {
      campaignName,
      targetVertical: input.targetVertical,
      campaignGoal: input.campaignGoal,
      primaryCTA: input.primaryCTA,
      lifecycleStage: input.lifecycleStage,
      salesMotion: input.salesMotion,
      executiveSummary: `${campaignName} helps ${audience} understand where changing ground conditions create earlier decisions for outreach, risk planning, and operational prioritization.`,
      launchPositioning: `Position Planet as a source of timely, visual evidence for ${input.targetVertical} teams that need clearer signals before decisions become urgent.`
    },
    audienceAndPain: {
      targetAudience: audience,
      buyerPersonas: ["Growth marketing lead", "Risk or operations leader", "Data product stakeholder"],
      buyerPains: [
        "Signals are scattered across static reports and delayed field updates.",
        "Teams need earlier evidence to prioritize outreach and response.",
        "Campaign and sales teams need clear proof points that stay grounded."
      ],
      accountSignals: ["Recent climate or resilience planning", "Risk modeling investment", "Geospatial data evaluation"],
      disqualificationFlags: ["No clear geospatial decision workflow", "Audience cannot act on satellite-derived insights"]
    },
    channelPlan,
    copyAssets: {
      email: {
        subjectLines: [`Earlier signals for ${campaignName}`, `${campaignName}: see risk sooner`, `Turn changing conditions into a clearer next step`],
        previewText: `Use Planet context to support ${input.targetVertical} decisions before risk escalates.`,
        body: `Hi there,\n\n${campaignName} is built for teams that need earlier visual evidence, not another static report. Planet helps teams monitor changing conditions, spot priority areas, and align stakeholders around a clearer next action.\n\nIf your team is planning around ${input.targetVertical.toLowerCase()} decisions, ${input.primaryCTA.toLowerCase()} to see how the workflow could support your next campaign or account motion.`
      },
      linkedIn: {
        headline: `${campaignName} starts with better evidence`,
        primaryText: `When conditions change quickly, teams need signals they can trust. Planet helps ${input.targetVertical} teams turn timely imagery into clearer campaign, planning, and response decisions.`,
        description: input.primaryCTA
      },
      sdrFollowUp: {
        opener: `I saw your team may be focused on ${campaignName.toLowerCase()} and wanted to share a practical Planet angle.`,
        talkTrack: `The value is not a generic account summary. It is earlier evidence for prioritizing accounts, regions, and actions with a clear campaign handoff.`,
        callToAction: input.primaryCTA
      },
      landingPage: {
        headline: `${campaignName}: move from delayed signals to earlier decisions`,
        subheadline: `Use Planet's Earth observation context to help ${audience} identify changing conditions, focus outreach, and support measurable campaign action.`,
        proofPoints: [
          "Near-daily Earth observation context",
          "Vertical-specific messaging and account signals",
          "Review-ready campaign assets with attribution discipline"
        ],
        formCTA: input.primaryCTA
      }
    },
    utmLinks: [],
    abTestPlan: {
      hypothesis: "A risk-readiness angle will produce stronger demo intent than a broad imagery education angle.",
      variantA: "Lead with earlier risk visibility and decision readiness.",
      variantB: "Lead with operational efficiency and fewer manual evidence workflows.",
      successMetric: "Demo request conversion rate",
      guardrailMetric: "Form completion quality and sales acceptance rate"
    },
    kpiPlan: {
      primaryKpi: input.campaignGoal.includes("demo") ? "Qualified demo requests" : input.campaignGoal,
      secondaryKpis: ["Landing page conversion rate", "Email click-through rate", "LinkedIn CTR", "Sales accepted leads"],
      leadingIndicators: ["Audience engagement by vertical", "CTA click quality", "SDR reply rate"],
      reportingNotes: "Report by channel, UTM campaign, member status, and sales follow-up outcome. Do not treat generated assets as launched integrations."
    },
    attributionReadiness: {
      score: 0,
      status: "blocked" as const,
      checks: [],
      missingItems: [],
      warnings: []
    },
    launchChecklist,
    reviewFlags,
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
    },
    evidenceUsed: evidence
  };

  const withUtms = { ...base, utmLinks: generateUtmLinks(input, campaignName) };
  const withReadiness = {
    ...withUtms,
    attributionReadiness: calculateAttributionReadiness(input, withUtms)
  };

  return {
    ...withReadiness,
    evalScore: evaluateCampaignPackage(input, withReadiness)
  };
}
