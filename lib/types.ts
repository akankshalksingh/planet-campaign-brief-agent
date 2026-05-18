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
