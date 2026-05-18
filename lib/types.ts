export const VERTICALS = [
  "Agriculture",
  "Defense and Intelligence",
  "Insurance and Risk",
  "Environmental and Climate",
  "Maritime",
  "Finance and Commodities",
  "Government and Civil"
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
  confidence: number;
  reasoning: string;
  possible_secondary_vertical: PlanetVerticalName | null;
};

export type EvalScores = {
  relevance: number;
  specificity: number;
  groundedness: number;
  actionability: number;
  total: number;
  flag: boolean;
  eval_notes: string;
};

export type CampaignBrief = {
  company_name: string;
  detected_vertical: PlanetVerticalName;
  company_overview: string;
  planet_use_case: string;
  planet_fit_score: number;
  fit_rationale: string;
  campaign_angle: string;
  suggested_next_action: string;
  risks_or_flags: string;
  eval_scores: EvalScores;
  vertical_detection: VerticalDetection;
  evidence: {
    company_context: SearchSnippet[];
    retrieved_planet_content: PlanetVertical[];
  };
  metadata: {
    model: string;
    search_quality: CompanyContext["searchQuality"];
    generated_at: string;
    human_review_required: boolean;
  };
};
