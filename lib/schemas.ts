import { z } from "zod";
import { CAMPAIGN_GOALS, RELATIONSHIP_TYPES, VERTICALS } from "@/lib/types";

const verticalEnum = z.enum(VERTICALS);
const relationshipEnum = z.enum(RELATIONSHIP_TYPES);
const campaignGoalEnum = z.enum(CAMPAIGN_GOALS);

const score5 = z.number().int().min(1).max(5);

export const verticalDetectionSchema = z.object({
  detected_vertical: verticalEnum,
  vertical_confidence: z.number().int().min(1).max(10),
  fit_score: z.number().int().min(1).max(10),
  classification_rationale: z.string().min(12),
  evidence_used: z.array(z.string()).default([]),
  why_not_other_verticals: z.object({
    Agriculture: z.string().default(""),
    "Defense and Intelligence": z.string().default(""),
    "Insurance and Risk": z.string().default(""),
    "Environmental and Climate": z.string().default(""),
    Maritime: z.string().default(""),
    "Finance and Commodities": z.string().default(""),
    "Government and Civil": z.string().default("")
  }),
  manual_review_required: z.boolean(),
  classification_warnings: z.array(z.string()).default([])
});

export const campaignStrategySchema = z.object({
  campaign_confidence: z.number().int().min(1).max(10),
  campaign_confidence_reason: z.string().min(12),
  matched_planet_campaign_pattern: z.object({
    pattern_name: z.string().min(1),
    why_this_pattern_matches: z.string().min(12),
    source_evidence_summary: z.array(z.string()).default([]),
    planet_style_notes: z.array(z.string()).default([])
  }),
  campaign_opportunity: z.object({
    core_gap: z.string().min(8),
    why_now: z.string().min(8),
    buyer_pain: z.string().min(8),
    planet_value: z.string().min(8),
    business_outcome: z.string().min(8)
  }),
  recommended_campaign: z.object({
    campaign_name: z.string().min(3),
    campaign_theme: z.string().min(8),
    primary_message: z.string().min(12),
    secondary_messages: z.array(z.string()).default([]),
    campaign_angle: z.string().min(12),
    one_line_pitch: z.string().min(12),
    cta: z.string().min(3),
    offer: z.string().min(3)
  }),
  targeting: z.object({
    primary_audience: z.array(z.string()).default([]),
    secondary_audience: z.array(z.string()).default([]),
    buyer_personas: z.array(z.string()).default([]),
    account_signals_to_watch: z.array(z.string()).default([]),
    disqualification_flags: z.array(z.string()).default([])
  }),
  content_assets: z.object({
    landing_page_headline: z.string().min(8),
    landing_page_subheadline: z.string().min(12),
    linkedin_ad_copy: z.string().min(12),
    email_subject_lines: z.array(z.string()).min(1),
    email_body_short: z.string().min(12),
    sales_enablement_blurb: z.string().min(12),
    webinar_or_event_angle: z.string().min(8),
    follow_up_sequence_idea: z.string().min(8)
  }),
  proof_points_to_use: z.array(z.string()).default([]),
  proof_points_to_avoid: z.array(z.string()).default([]),
  recommended_channels: z.array(z.string()).default([]),
  experiment_plan: z.object({
    hypothesis: z.string().min(8),
    variant_a: z.string().min(3),
    variant_b: z.string().min(3),
    success_metric: z.string().min(3),
    guardrail_metric: z.string().min(3)
  }),
  gtm_impact: z.object({
    how_this_saves_time: z.string().min(8),
    how_this_improves_lead_quality: z.string().min(8),
    how_this_improves_sales_handoff: z.string().min(8),
    primary_kpi: z.string().min(3),
    secondary_kpis: z.array(z.string()).default([])
  }),
  human_review_required: z.boolean(),
  review_notes: z.array(z.string()).default([]),
  risk_flags: z.array(z.string()).default([])
});

export const campaignEvalSchema = z
  .object({
    account_relevance: score5,
    planet_fit: score5,
    campaign_specificity: score5,
    planet_voice_alignment: score5,
    groundedness: score5,
    actionability: score5,
    gtm_impact: score5,
    classification_safety: score5,
    total_score: z.number().int().min(8).max(40),
    max_score: z.literal(40).default(40),
    quality_band: z.enum(["strong", "usable_with_edits", "weak", "unsafe"]),
    human_review_required: z.boolean(),
    top_strengths: z.array(z.string()).default([]),
    top_gaps: z.array(z.string()).default([]),
    specific_improvements: z.array(z.string()).default([]),
    final_recommendation: z.string().min(8)
  })
  .transform((value) => {
    const total =
      value.account_relevance +
      value.planet_fit +
      value.campaign_specificity +
      value.planet_voice_alignment +
      value.groundedness +
      value.actionability +
      value.gtm_impact +
      value.classification_safety;

    const quality_band: "strong" | "usable_with_edits" | "weak" | "unsafe" =
      total >= 34
        ? "strong"
        : total >= 27
          ? "usable_with_edits"
          : total >= 20
            ? "weak"
            : "unsafe";

    return {
      ...value,
      total_score: total,
      max_score: 40 as const,
      quality_band,
      human_review_required: value.human_review_required || total < 34
    };
  });

export const requestSchema = z.object({
  companyName: z.string().trim().min(2).max(120)
});

export const campaignIdeaRequestSchema = z.object({
  campaignIdea: z.string().trim().min(3).max(1200),
  optionalTargetAccount: z.string().trim().max(120).optional().default(""),
  relationshipType: relationshipEnum,
  campaignGoal: campaignGoalEnum
});

const confidenceEnum = z.enum(["high", "medium", "low"]);
const priorityEnum = z.enum(["high", "medium", "low"]);
const motionEnum = z.enum([
  "expansion",
  "adoption",
  "renewal_support",
  "executive_education",
  "event_follow_up",
  "account_progression",
  "net_new_awareness"
]);

export const campaignIdeaStrategySchema = z.object({
  campaign_idea_strategy: z.object({
    campaign_idea: z.string().min(3),
    optional_target_account: z.string().default(""),
    relationship_type: relationshipEnum,
    campaign_goal: campaignGoalEnum,
    fit_assessment: z.object({
      recommended_verticals: z
        .array(
          z.object({
            vertical: verticalEnum,
            fit_score: z.number().int().min(1).max(10),
            why_it_fits: z.string().min(8),
            confidence: confidenceEnum
          })
        )
        .min(1),
      not_recommended_verticals: z
        .array(
          z.object({
            vertical: verticalEnum,
            reason: z.string().min(8)
          })
        )
        .default([]),
      overall_confidence: confidenceEnum,
      manual_review_required: z.boolean()
    }),
    account_recommendations: z
      .array(
        z.object({
          account_name: z.string().min(1),
          vertical: verticalEnum,
          relationship_type: relationshipEnum,
          fit_score: z.number().int().min(1).max(10),
          why_target_this_account: z.string().min(8),
          suggested_motion: z.string().min(4),
          review_risk: z.string().min(4)
        })
      )
      .default([]),
    existing_account_strategy: z.object({
      is_existing_account_motion: z.boolean(),
      do_not_treat_as_net_new: z.boolean(),
      recommended_motion: motionEnum,
      relationship_risk_notes: z.array(z.string()).default([]),
      next_best_action: z.string().min(8)
    }),
    gtm_strategy: z.object({
      campaign_name: z.string().min(3),
      campaign_theme: z.string().min(8),
      primary_message: z.string().min(12),
      one_line_pitch: z.string().min(8),
      buyer_pain: z.string().min(8),
      planet_value: z.string().min(8),
      business_outcome: z.string().min(8),
      cta: z.string().min(3),
      offer: z.string().min(3)
    }),
    targeting: z.object({
      best_fit_accounts: z.array(z.string()).default([]),
      primary_personas: z.array(z.string()).default([]),
      secondary_personas: z.array(z.string()).default([]),
      account_signals_to_watch: z.array(z.string()).default([]),
      disqualification_flags: z.array(z.string()).default([])
    }),
    channel_strategy: z.object({
      recommended_channels: z
        .array(
          z.object({
            channel: z.string().min(2),
            why_this_channel: z.string().min(8),
            best_for: z.string().min(4),
            priority: priorityEnum
          })
        )
        .default([]),
      channels_to_avoid: z
        .array(
          z.object({
            channel: z.string().min(2),
            reason: z.string().min(8)
          })
        )
        .default([])
    }),
    copy_starters: z.object({
      landing_page_headline: z.string().min(8),
      landing_page_subheadline: z.string().min(12),
      linkedin_ad_copy: z.string().min(12),
      email_subject_lines: z.array(z.string()).min(1),
      email_body_short: z.string().min(12),
      sales_handoff_note: z.string().min(12),
      webinar_or_event_title: z.string().min(8),
      nurture_sequence_idea: z.string().min(8)
    }),
    experiment_plan: z.object({
      hypothesis: z.string().min(8),
      variant_a_message: z.string().min(3),
      variant_b_message: z.string().min(3),
      success_metric: z.string().min(3),
      guardrail_metric: z.string().min(3),
      learning_goal: z.string().min(8)
    }),
    gtm_impact: z.object({
      how_this_saves_time: z.string().min(8),
      how_this_improves_lead_quality: z.string().min(8),
      how_this_improves_sales_handoff: z.string().min(8),
      primary_kpi: z.string().min(3),
      secondary_kpis: z.array(z.string()).default([])
    }),
    review_flags: z.object({
      human_review_required: z.boolean(),
      claims_to_validate: z.array(z.string()).default([]),
      safe_to_use_externally: z.boolean(),
      notes: z.array(z.string()).default([])
    })
  })
});

export const campaignIdeaEvalSchema = z
  .object({
    campaign_idea_eval: z.object({
      idea_to_vertical_fit: score5,
      account_targeting_quality: score5,
      relationship_awareness: score5,
      planet_voice_alignment: score5,
      channel_strategy: score5,
      copy_usefulness: score5,
      gtm_impact: score5,
      safety_and_review_quality: score5,
      total_score: z.number().int().min(8).max(40),
      max_score: z.literal(40).default(40),
      quality_band: z.enum(["strong", "usable_with_edits", "weak", "unsafe"]),
      human_review_required: z.boolean(),
      top_strengths: z.array(z.string()).default([]),
      top_gaps: z.array(z.string()).default([]),
      specific_improvements: z.array(z.string()).default([]),
      final_recommendation: z.string().min(8)
    })
  })
  .transform((value) => {
    const evalScores = value.campaign_idea_eval;
    const total =
      evalScores.idea_to_vertical_fit +
      evalScores.account_targeting_quality +
      evalScores.relationship_awareness +
      evalScores.planet_voice_alignment +
      evalScores.channel_strategy +
      evalScores.copy_usefulness +
      evalScores.gtm_impact +
      evalScores.safety_and_review_quality;

    const quality_band: "strong" | "usable_with_edits" | "weak" | "unsafe" =
      total >= 34
        ? "strong"
        : total >= 27
          ? "usable_with_edits"
          : total >= 20
            ? "weak"
            : "unsafe";

    return {
      campaign_idea_eval: {
        ...evalScores,
        total_score: total,
        max_score: 40 as const,
        quality_band,
        human_review_required: evalScores.human_review_required || total < 34
      }
    };
  });
