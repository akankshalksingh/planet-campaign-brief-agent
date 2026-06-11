import { z } from "zod";

export const CAMPAIGN_BUILDER_CHANNELS = [
  "Email",
  "LinkedIn Paid",
  "SDR Follow-up",
  "Landing Page",
  "Webinar",
  "Event Follow-up",
  "Organic Social",
  "Paid Search"
] as const;

export const LIFECYCLE_STAGES = ["Awareness", "Consideration", "Conversion"] as const;

export const SALES_MOTIONS = ["ABM", "inbound", "event follow-up", "freemium lifecycle"] as const;

const channelEnum = z.enum(CAMPAIGN_BUILDER_CHANNELS);
const score5 = z.number().int().min(1).max(5);

export const CampaignBuilderInputSchema = z.object({
  campaignIdea: z.string().trim().min(3).max(2000),
  campaignName: z.string().trim().min(3).max(180).optional(),
  targetVertical: z.string().trim().min(2).max(120),
  targetAudience: z.string().trim().min(5).max(2000),
  campaignGoal: z.string().trim().min(3).max(300),
  primaryCTA: z.string().trim().min(2).max(160),
  landingPageUrl: z.string().trim().min(5).max(500),
  region: z.string().trim().max(160).optional().default(""),
  channels: z.array(channelEnum).min(1),
  lifecycleStage: z.enum(LIFECYCLE_STAGES).optional().default("Consideration"),
  campaignOwner: z.string().trim().max(160).optional().default(""),
  salesMotion: z.enum(SALES_MOTIONS).optional().default("ABM"),
  notes: z.string().trim().max(2500).optional().default("")
});

export const ReviewFlagSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  flag: z.string().min(3),
  recommendation: z.string().min(8)
});

export const UtmlinkSchema = z.object({
  channel: channelEnum,
  asset: z.string().min(2),
  url: z.string().min(5),
  utm_source: z.string().min(1),
  utm_medium: z.string().min(1),
  utm_campaign: z.string().min(1),
  utm_content: z.string().min(1),
  utm_term: z.string().optional(),
  validation: z.object({
    status: z.enum(["valid", "warning", "error"]),
    issues: z.array(z.string()).default([])
  })
});

export const CampaignBuilderOutputSchema = z.object({
  campaignSummary: z.object({
    campaignName: z.string().min(3),
    targetVertical: z.string().min(2),
    campaignGoal: z.string().min(3),
    primaryCTA: z.string().min(2),
    lifecycleStage: z.string().min(2),
    salesMotion: z.string().min(2),
    executiveSummary: z.string().min(20),
    launchPositioning: z.string().min(12)
  }),
  audienceAndPain: z.object({
    targetAudience: z.string().min(5),
    buyerPersonas: z.array(z.string()).min(1),
    buyerPains: z.array(z.string()).min(1),
    accountSignals: z.array(z.string()).default([]),
    disqualificationFlags: z.array(z.string()).default([])
  }),
  channelPlan: z.array(
    z.object({
      channel: channelEnum,
      role: z.string().min(5),
      recommendedUse: z.string().min(8),
      opsNotes: z.string().min(8),
      priority: z.enum(["high", "medium", "low"])
    })
  ),
  copyAssets: z.object({
    email: z
      .object({
        subjectLines: z.array(z.string()).default([]),
        previewText: z.string().default(""),
        body: z.string().default("")
      })
      .default({ subjectLines: [], previewText: "", body: "" }),
    linkedIn: z
      .object({
        headline: z.string().default(""),
        primaryText: z.string().default(""),
        description: z.string().default("")
      })
      .default({ headline: "", primaryText: "", description: "" }),
    sdrFollowUp: z
      .object({
        opener: z.string().default(""),
        talkTrack: z.string().default(""),
        callToAction: z.string().default("")
      })
      .default({ opener: "", talkTrack: "", callToAction: "" }),
    landingPage: z.object({
      headline: z.string().min(5),
      subheadline: z.string().min(8),
      proofPoints: z.array(z.string()).default([]),
      formCTA: z.string().min(2)
    })
  }),
  utmLinks: z.array(UtmlinkSchema).default([]),
  abTestPlan: z.object({
    hypothesis: z.string().min(8),
    variantA: z.string().min(3),
    variantB: z.string().min(3),
    successMetric: z.string().min(3),
    guardrailMetric: z.string().min(3)
  }),
  kpiPlan: z.object({
    primaryKpi: z.string().min(3),
    secondaryKpis: z.array(z.string()).default([]),
    leadingIndicators: z.array(z.string()).default([]),
    reportingNotes: z.string().min(8)
  }),
  attributionReadiness: z.object({
    score: z.number().int().min(0).max(100),
    status: z.enum(["ready", "needs_review", "blocked"]),
    checks: z.array(
      z.object({
        label: z.string(),
        passed: z.boolean(),
        weight: z.number().int(),
        note: z.string()
      })
    ),
    missingItems: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([])
  }),
  launchChecklist: z.array(
    z.object({
      category: z.string(),
      item: z.string(),
      status: z.enum(["done", "needs_review", "missing"]),
      owner: z.string(),
      notes: z.string()
    })
  ),
  reviewFlags: z.array(ReviewFlagSchema).default([]),
  evalScore: z.object({
    accountVerticalRelevance: score5,
    planetFit: score5,
    campaignSpecificity: score5,
    channelReadiness: score5,
    attributionReadiness: score5,
    groundedness: score5,
    actionability: score5,
    humanReviewSafety: score5,
    totalScore: z.number().int().min(8).max(40),
    maxScore: z.literal(40).default(40),
    status: z.enum(["Strong, ready for human review", "Useful, needs marketing ops review", "Weak, revise before use", "Blocked, not launchable"]),
    notes: z.array(z.string()).default([])
  }),
  evidenceUsed: z.object({
    verticalContext: z.array(z.string()).default([]),
    campaignPatterns: z.array(z.string()).default([]),
    deterministicRules: z.array(z.string()).default([])
  })
});

export type CampaignBuilderInput = z.infer<typeof CampaignBuilderInputSchema>;
export type CampaignBuilderOutput = z.infer<typeof CampaignBuilderOutputSchema>;
export type CampaignBuilderChannel = (typeof CAMPAIGN_BUILDER_CHANNELS)[number];
export type ReviewFlag = z.infer<typeof ReviewFlagSchema>;
