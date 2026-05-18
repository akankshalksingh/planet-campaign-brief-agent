export const VERTICALS = [
  "Agriculture",
  "Defense and Intelligence",
  "Insurance and Risk",
  "Environmental and Climate",
  "Maritime",
  "Finance and Commodities",
  "Government and Civil",
  "Other / Adjacent / Manual Review"
] as const;

export type PlanetVerticalName = (typeof VERTICALS)[number];

export type PlanetVertical = {
  vertical: PlanetVerticalName;
  icp_examples: string[];
  customer_pain: string;
  how_planet_helps: string;
  proof_points: string[];
  messaging_angle: string;
  kpis: string[];
  risk_guidance: string;
};

export type SearchSnippet = {
  title: string;
  url: string;
  snippet: string;
  source: "tavily" | "duckduckgo" | "curated";
};

export type CompanyContext = {
  query: string;
  summary: string;
  snippets: SearchSnippet[];
  searchQuality: "live" | "fallback" | "weak";
  generatedAt: string;
};

export type VerticalDetection = {
  detected_vertical: PlanetVerticalName;
  vertical_confidence: number;
  fit_score: number;
  classification_rationale: string;
  evidence_used: string[];
  why_not_other_verticals: Record<Exclude<PlanetVerticalName, "Other / Adjacent / Manual Review">, string>;
  manual_review_required: boolean;
  classification_warnings: string[];
};

export type CampaignPattern = {
  pattern_name: string;
  verticals: PlanetVerticalName[];
  hook_type: string;
  core_message: string;
  buyer_pains: string[];
  planet_capabilities: string[];
  business_outcomes: string[];
  cta_styles: string[];
  tone_notes: string[];
  reusable_hooks: string[];
  proof_points: string[];
  avoid: string[];
};

export type MatchedCampaignPattern = {
  pattern_name: string;
  why_this_pattern_matches: string;
  source_evidence_summary: string[];
  planet_style_notes: string[];
};

export type CampaignStrategy = {
  campaign_confidence: number;
  campaign_confidence_reason: string;
  matched_planet_campaign_pattern: MatchedCampaignPattern;
  campaign_opportunity: {
    core_gap: string;
    why_now: string;
    buyer_pain: string;
    planet_value: string;
    business_outcome: string;
  };
  recommended_campaign: {
    campaign_name: string;
    campaign_theme: string;
    primary_message: string;
    secondary_messages: string[];
    campaign_angle: string;
    one_line_pitch: string;
    cta: string;
    offer: string;
  };
  targeting: {
    primary_audience: string[];
    secondary_audience: string[];
    buyer_personas: string[];
    account_signals_to_watch: string[];
    disqualification_flags: string[];
  };
  content_assets: {
    landing_page_headline: string;
    landing_page_subheadline: string;
    linkedin_ad_copy: string;
    email_subject_lines: string[];
    email_body_short: string;
    sales_enablement_blurb: string;
    webinar_or_event_angle: string;
    follow_up_sequence_idea: string;
  };
  proof_points_to_use: string[];
  proof_points_to_avoid: string[];
  recommended_channels: string[];
  experiment_plan: {
    hypothesis: string;
    variant_a: string;
    variant_b: string;
    success_metric: string;
    guardrail_metric: string;
  };
  gtm_impact: {
    how_this_saves_time: string;
    how_this_improves_lead_quality: string;
    how_this_improves_sales_handoff: string;
    primary_kpi: string;
    secondary_kpis: string[];
  };
  human_review_required: boolean;
  review_notes: string[];
  risk_flags: string[];
};

export type CampaignEval = {
  account_relevance: number;
  planet_fit: number;
  campaign_specificity: number;
  planet_voice_alignment: number;
  groundedness: number;
  actionability: number;
  gtm_impact: number;
  classification_safety: number;
  total_score: number;
  max_score: 40;
  quality_band: "strong" | "usable_with_edits" | "weak" | "unsafe";
  human_review_required: boolean;
  top_strengths: string[];
  top_gaps: string[];
  specific_improvements: string[];
  final_recommendation: string;
};

export type CampaignRecommendation = {
  company_name: string;
  detected_vertical: PlanetVerticalName;
  account_context: {
    summary: string;
    search_quality: CompanyContext["searchQuality"];
    evidence: SearchSnippet[];
  };
  vertical_detection: VerticalDetection;
  campaign_strategy: CampaignStrategy;
  campaign_eval: CampaignEval;
  evidence: {
    company_context: SearchSnippet[];
    retrieved_planet_content: PlanetVertical[];
    campaign_patterns: CampaignPattern[];
  };
  metadata: {
    model: string;
    search_quality: CompanyContext["searchQuality"];
    generated_at: string;
    human_review_required: boolean;
    fallback_used: boolean;
  };
};

export type LegacyEvalScores = {
  relevance: number;
  specificity: number;
  groundedness: number;
  actionability: number;
  total: number;
  flag: boolean;
  eval_notes: string;
};

export type CampaignBrief = CampaignRecommendation & {
  company_overview: string;
  planet_use_case: string;
  planet_fit_score: number;
  fit_rationale: string;
  campaign_angle: string;
  suggested_next_action: string;
  risks_or_flags: string;
  eval_scores: LegacyEvalScores;
};

export type LegacyVerticalDetection = {
  detected_vertical: PlanetVerticalName;
  confidence: number;
  reasoning: string;
  possible_secondary_vertical: PlanetVerticalName | null;
};

export const RELATIONSHIP_TYPES = [
  "New prospect",
  "Existing target account",
  "Existing customer",
  "Partner",
  "Unknown"
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const CAMPAIGN_GOALS = [
  "Net-new pipeline",
  "Expansion",
  "Product adoption",
  "Renewal support",
  "Event follow-up",
  "Executive awareness",
  "Education"
] as const;

export type CampaignGoal = (typeof CAMPAIGN_GOALS)[number];

export type SeedAccount = {
  name: string;
  vertical: PlanetVerticalName;
  relationshipType: RelationshipType;
  fitNotes: string;
  personas: string[];
  accountSignals: string[];
  suggestedMotions: string[];
  disqualificationFlags: string[];
  reviewRequired: boolean;
};

export type CampaignIdeaRequest = {
  campaignIdea: string;
  optionalTargetAccount?: string;
  relationshipType: RelationshipType;
  campaignGoal: CampaignGoal;
};

export type CampaignIdeaStrategy = {
  campaign_idea_strategy: {
    campaign_idea: string;
    optional_target_account: string;
    relationship_type: RelationshipType;
    campaign_goal: CampaignGoal;
    fit_assessment: {
      recommended_verticals: Array<{
        vertical: PlanetVerticalName;
        fit_score: number;
        why_it_fits: string;
        confidence: "high" | "medium" | "low";
      }>;
      not_recommended_verticals: Array<{
        vertical: PlanetVerticalName;
        reason: string;
      }>;
      overall_confidence: "high" | "medium" | "low";
      manual_review_required: boolean;
    };
    account_recommendations: Array<{
      account_name: string;
      vertical: PlanetVerticalName;
      relationship_type: RelationshipType;
      fit_score: number;
      why_target_this_account: string;
      suggested_motion: string;
      review_risk: string;
    }>;
    existing_account_strategy: {
      is_existing_account_motion: boolean;
      do_not_treat_as_net_new: boolean;
      recommended_motion:
        | "expansion"
        | "adoption"
        | "renewal_support"
        | "executive_education"
        | "event_follow_up"
        | "account_progression"
        | "net_new_awareness";
      relationship_risk_notes: string[];
      next_best_action: string;
    };
    gtm_strategy: {
      campaign_name: string;
      campaign_theme: string;
      primary_message: string;
      one_line_pitch: string;
      buyer_pain: string;
      planet_value: string;
      business_outcome: string;
      cta: string;
      offer: string;
    };
    targeting: {
      best_fit_accounts: string[];
      primary_personas: string[];
      secondary_personas: string[];
      account_signals_to_watch: string[];
      disqualification_flags: string[];
    };
    channel_strategy: {
      recommended_channels: Array<{
        channel: string;
        why_this_channel: string;
        best_for: string;
        priority: "high" | "medium" | "low";
      }>;
      channels_to_avoid: Array<{
        channel: string;
        reason: string;
      }>;
    };
    copy_starters: {
      landing_page_headline: string;
      landing_page_subheadline: string;
      linkedin_ad_copy: string;
      email_subject_lines: string[];
      email_body_short: string;
      sales_handoff_note: string;
      webinar_or_event_title: string;
      nurture_sequence_idea: string;
    };
    experiment_plan: {
      hypothesis: string;
      variant_a_message: string;
      variant_b_message: string;
      success_metric: string;
      guardrail_metric: string;
      learning_goal: string;
    };
    gtm_impact: {
      how_this_saves_time: string;
      how_this_improves_lead_quality: string;
      how_this_improves_sales_handoff: string;
      primary_kpi: string;
      secondary_kpis: string[];
    };
    review_flags: {
      human_review_required: boolean;
      claims_to_validate: string[];
      safe_to_use_externally: boolean;
      notes: string[];
    };
  };
};

export type CampaignIdeaEval = {
  campaign_idea_eval: {
    idea_to_vertical_fit: number;
    account_targeting_quality: number;
    relationship_awareness: number;
    planet_voice_alignment: number;
    channel_strategy: number;
    copy_usefulness: number;
    gtm_impact: number;
    safety_and_review_quality: number;
    total_score: number;
    max_score: 40;
    quality_band: "strong" | "usable_with_edits" | "weak" | "unsafe";
    human_review_required: boolean;
    top_strengths: string[];
    top_gaps: string[];
    specific_improvements: string[];
    final_recommendation: string;
  };
};

export type CampaignIdeaResult = CampaignIdeaStrategy & {
  campaign_idea_eval: CampaignIdeaEval["campaign_idea_eval"];
  metadata: {
    model: string;
    generated_at: string;
    fallback_used: boolean;
    human_review_required: boolean;
  };
};
