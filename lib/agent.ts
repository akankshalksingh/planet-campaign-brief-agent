import { generateJson, GEMINI_MODEL } from "@/lib/gemini";
import {
  formatCampaignPatterns,
  formatVerticalContext,
  isPlanetVertical,
  retrieveCampaignPatterns,
  retrievePlanetContext
} from "@/lib/knowledge";
import { campaignEvalPrompt, campaignStrategyPrompt, verticalDetectionPrompt } from "@/lib/prompts";
import { campaignEvalSchema, campaignStrategySchema, verticalDetectionSchema } from "@/lib/schemas";
import { searchCompany } from "@/lib/search";
import {
  CampaignBrief,
  CampaignEval,
  CampaignPattern,
  CampaignStrategy,
  PlanetVertical,
  PlanetVerticalName,
  VerticalDetection
} from "@/lib/types";
import { stringifyForPrompt } from "@/lib/json";

const OTHER_VERTICAL: PlanetVerticalName = "Other / Adjacent / Manual Review";

const verticalKeywords: Array<{ vertical: PlanetVerticalName; terms: string[]; exclusions?: string[] }> = [
  {
    vertical: "Agriculture",
    terms: ["agriculture", "crop", "farm", "seed", "syngenta", "basf", "xarvio", "agronomy"]
  },
  {
    vertical: "Defense and Intelligence",
    terms: ["defense", "aerospace", "military", "intelligence", "lockheed", "nato", "nga", "isr"]
  },
  {
    vertical: "Insurance and Risk",
    terms: ["insurance", "reinsurance", "claims", "risk", "axa", "munich re", "swiss re"]
  },
  {
    vertical: "Environmental and Climate",
    terms: ["climate", "environment", "forest", "biodiversity", "carbon", "deforestation", "vito"]
  },
  {
    vertical: "Maritime",
    terms: ["port", "maritime", "shipping", "vessel", "coast guard", "maersk", "rotterdam", "fisheries"]
  },
  {
    vertical: "Finance and Commodities",
    terms: ["finance", "investment", "asset management", "commodity", "blackrock", "hedge fund", "trading"]
  },
  {
    vertical: "Government and Civil",
    terms: ["government", "agency", "disaster", "fema", "noaa", "nasa", "municipal", "public-sector"],
    exclusions: ["uber", "apple", "walmart", "google", "meta", "amazon", "microsoft"]
  }
];

const adjacentCompanies = ["uber", "apple", "walmart", "google", "meta", "amazon", "microsoft", "tesla"];

function whyNotDefaults(companyName: string) {
  return {
    Agriculture: `${companyName} is not clearly evidenced as a crop science, farming, agronomy, or agricultural monitoring account.`,
    "Defense and Intelligence": `${companyName} is not clearly evidenced as a defense contractor, military organization, intelligence agency, or ISR account.`,
    "Insurance and Risk": `${companyName} is not clearly evidenced as an insurer, reinsurer, catastrophe modeler, or claims/risk platform.`,
    "Environmental and Climate": `${companyName} is not clearly evidenced as a climate, conservation, forestry, biodiversity, or environmental monitoring account.`,
    Maritime: `${companyName} is not clearly evidenced as a port, vessel, shipping, fisheries, coast guard, or maritime domain awareness account.`,
    "Finance and Commodities": `${companyName} is not clearly evidenced as a financial research, commodity, market intelligence, trading, or alternative data account.`,
    "Government and Civil": `${companyName} is not clearly evidenced as a public-sector agency, civil government department, disaster response body, public infrastructure agency, or public research organization.`
  };
}

function detectVerticalFallback(companyName: string, context: string): VerticalDetection {
  const haystack = `${companyName} ${context}`.toLowerCase();
  const normalizedName = companyName.toLowerCase().trim();

  if (adjacentCompanies.some((item) => normalizedName.includes(item))) {
    return {
      detected_vertical: OTHER_VERTICAL,
      vertical_confidence: 4,
      fit_score: 3,
      classification_rationale: `${companyName} appears to be a commercial or adjacent account rather than a clear fit for one of the seven MVP Planet verticals.`,
      evidence_used: ["Fallback classification used conservative adjacent-company rules."],
      why_not_other_verticals: whyNotDefaults(companyName),
      manual_review_required: true,
      classification_warnings: [
        "No strong Planet MVP vertical fit found.",
        "Do not force this account into Government and Civil.",
        "Consider adjacent mapping, mobility, infrastructure, retail, or logistics use cases only after human review."
      ]
    };
  }

  const scored = verticalKeywords
    .map((item) => {
      const score = item.terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      const excluded = item.exclusions?.some((term) => haystack.includes(term)) ?? false;
      return { vertical: item.vertical, score: excluded ? 0 : score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const ambiguous = !best || best.score < 1;

  return {
    detected_vertical: ambiguous ? OTHER_VERTICAL : best.vertical,
    vertical_confidence: ambiguous ? 3 : Math.min(8, 4 + best.score),
    fit_score: ambiguous ? 3 : Math.min(8, 4 + best.score),
    classification_rationale: ambiguous
      ? `${companyName} does not clearly map to a supported Planet MVP vertical from the available context.`
      : `Fallback keyword classification found evidence for ${best.vertical}.`,
    evidence_used: ambiguous
      ? ["Available context did not provide strong vertical-specific evidence."]
      : [`Available context matched ${best.vertical} terms.`],
    why_not_other_verticals: whyNotDefaults(companyName),
    manual_review_required: ambiguous,
    classification_warnings: ambiguous
      ? ["No strong Planet MVP vertical fit found.", "Human review required before campaign use."]
      : []
  };
}

function fallbackCampaignStrategy(params: {
  companyName: string;
  classification: VerticalDetection;
  retrievedContent: PlanetVertical[];
  patterns: CampaignPattern[];
}): CampaignStrategy {
  const pattern = params.patterns[0];
  const verticalContext = params.retrievedContent[0];
  const isAdjacent = params.classification.detected_vertical === OTHER_VERTICAL;
  const firstHook = pattern.reusable_hooks[0] ?? "Turn account signal into campaign action.";
  const firstCta = pattern.cta_styles[0] ?? "Review account fit";

  return campaignStrategySchema.parse({
    campaign_confidence: isAdjacent ? 3 : Math.min(8, params.classification.fit_score),
    campaign_confidence_reason: isAdjacent
      ? "Adjacent-fit account; campaign should remain exploratory until human GTM validation."
      : "Fallback strategy uses approved vertical context and curated Planet campaign patterns.",
    matched_planet_campaign_pattern: {
      pattern_name: pattern.pattern_name,
      why_this_pattern_matches: isAdjacent
        ? "The account does not clearly fit a supported vertical, so the adjacent account exploration pattern is safest."
        : `The account maps to ${params.classification.detected_vertical}, which aligns with this curated Planet pattern.`,
      source_evidence_summary: pattern.proof_points,
      planet_style_notes: pattern.tone_notes
    },
    campaign_opportunity: {
      core_gap: isAdjacent
        ? "Possible Earth intelligence use case is not yet validated."
        : verticalContext.customer_pain,
      why_now: "Growth teams can reduce manual account research by turning account context into a reviewed campaign starting point.",
      buyer_pain: isAdjacent ? pattern.buyer_pains[0] : verticalContext.customer_pain,
      planet_value: isAdjacent ? pattern.core_message : verticalContext.how_planet_helps,
      business_outcome: pattern.business_outcomes[0] ?? "Better campaign prioritization and sales handoff."
    },
    recommended_campaign: {
      campaign_name: isAdjacent ? `Validate ${params.companyName} Earth Intelligence Fit` : firstHook,
      campaign_theme: pattern.hook_type,
      primary_message: isAdjacent
        ? `${params.companyName} may have an adjacent mapping, infrastructure, or logistics use case, but it should not be treated as a strong MVP vertical fit without human validation.`
        : pattern.core_message,
      secondary_messages: pattern.reusable_hooks.slice(1, 3),
      campaign_angle: firstHook,
      one_line_pitch: isAdjacent
        ? "Explore whether a credible adjacent Planet use case exists before creating external campaign assets."
        : pattern.core_message,
      cta: firstCta,
      offer: isAdjacent ? "Internal account fit review" : "Vertical-specific campaign consultation"
    },
    targeting: {
      primary_audience: isAdjacent ? ["GTM strategy reviewer", "Account owner"] : ["Growth marketing", "Vertical sales owner"],
      secondary_audience: isAdjacent ? ["Solutions consultant"] : ["Sales engineering", "Demand generation"],
      buyer_personas: isAdjacent ? ["Account strategist", "GTM operations lead"] : ["Business unit leader", "Data or operations leader"],
      account_signals_to_watch: isAdjacent
        ? ["Mapping, infrastructure, logistics, resilience, or geospatial initiatives"]
        : ["New public initiatives", "Events/webinars", "Signals tied to the vertical pain point"],
      disqualification_flags: isAdjacent
        ? ["No clear Earth intelligence use case", "Only generic consumer/enterprise context found"]
        : ["No vertical-specific pain", "Unsupported relationship or customer claim"]
    },
    content_assets: {
      landing_page_headline: firstHook,
      landing_page_subheadline: isAdjacent
        ? "A human-reviewed exploration of possible mapping, infrastructure, or logistics intelligence use cases."
        : pattern.core_message,
      linkedin_ad_copy: isAdjacent
        ? "Not every account should become a campaign. Use Planet GTM intelligence to validate adjacent Earth intelligence opportunities before outreach."
        : `${pattern.buyer_pains[0]} Planet helps teams act with ${pattern.planet_capabilities[0].toLowerCase()}.`,
      email_subject_lines: isAdjacent
        ? ["Validate adjacent Earth intelligence fit", "Is there a Planet use case here?"]
        : [firstHook, pattern.reusable_hooks[1] ?? pattern.hook_type],
      email_body_short: isAdjacent
        ? "This account looks adjacent rather than a clear Planet MVP vertical fit. Recommend reviewing mapping, infrastructure, or logistics signals before external outreach."
        : `A quick campaign angle for ${params.companyName}: ${pattern.core_message}`,
      sales_enablement_blurb: isAdjacent
        ? "Treat as adjacent. Validate business unit, use case, and buyer pain before routing to a vertical campaign."
        : `${params.companyName} maps to ${params.classification.detected_vertical}. Lead with ${pattern.hook_type.toLowerCase()} and use approved proof points only.`,
      webinar_or_event_angle: isAdjacent ? "When adjacent accounts deserve GTM review" : pattern.hook_type,
      follow_up_sequence_idea: isAdjacent
        ? "Send to human GTM review, then decide whether to create account-specific outreach."
        : "Follow with proof point, use-case asset, sales handoff, and KPI tracking."
    },
    proof_points_to_use: pattern.proof_points,
    proof_points_to_avoid: pattern.avoid,
    recommended_channels: isAdjacent ? ["Internal sales review", "Account planning"] : ["LinkedIn", "Email nurture", "Sales handoff", "Webinar follow-up"],
    experiment_plan: {
      hypothesis: isAdjacent
        ? "Review-gated adjacent account handling will reduce poor-fit campaign routing."
        : "Outcome-led vertical messaging will outperform feature-led satellite imagery messaging.",
      variant_a: pattern.reusable_hooks[0] ?? "Outcome-led messaging",
      variant_b: pattern.reusable_hooks[1] ?? "Capability-led messaging",
      success_metric: isAdjacent ? "Human approval rate" : "MQL-to-SQL conversion rate",
      guardrail_metric: "Sales rejection or disqualification rate"
    },
    gtm_impact: {
      how_this_saves_time: "Reduces manual account research, vertical mapping, first-draft campaign strategy, and copy starter work.",
      how_this_improves_lead_quality: "Adds fit scoring, disqualification flags, and human review gates before campaign action.",
      how_this_improves_sales_handoff: "Packages buyer pain, message, proof points, and next action for sales review.",
      primary_kpi: isAdjacent ? "AI output approval rate" : "Campaign brief-to-launch time",
      secondary_kpis: ["Sales acceptance rate", "MQL-to-SQL conversion", "CTA conversion rate", "Campaign-sourced pipeline"]
    },
    human_review_required: true,
    review_notes: isAdjacent
      ? ["Adjacent fit. Human review required before campaign launch."]
      : ["Validate account-specific facts and relationship status before external use."],
    risk_flags: isAdjacent ? ["No strong Planet MVP vertical fit found."] : []
  });
}

function fallbackEval(isAdjacent: boolean): CampaignEval {
  return campaignEvalSchema.parse({
    account_relevance: isAdjacent ? 3 : 4,
    planet_fit: isAdjacent ? 2 : 4,
    campaign_specificity: 3,
    planet_voice_alignment: 4,
    groundedness: 3,
    actionability: 4,
    gtm_impact: 4,
    classification_safety: isAdjacent ? 5 : 4,
    total_score: isAdjacent ? 28 : 30,
    max_score: 40,
    quality_band: "usable_with_edits",
    human_review_required: true,
    top_strengths: ["Uses curated Planet campaign patterns", "Keeps human review in the workflow"],
    top_gaps: isAdjacent ? ["Adjacent use case needs human validation"] : ["Source quality should be validated before launch"],
    specific_improvements: ["Add CRM and campaign engagement history when available"],
    final_recommendation: isAdjacent
      ? "Use only as an internal account-fit exploration."
      : "Usable as a first-pass campaign strategy with human review."
  });
}

function enforceSafety(value: CampaignBrief): CampaignBrief {
  const isAdjacent = value.detected_vertical === OTHER_VERTICAL;
  const sensitive =
    value.detected_vertical === "Defense and Intelligence" || value.detected_vertical === "Government and Civil";

  const riskFlags = [...value.campaign_strategy.risk_flags];
  const reviewNotes = [...value.campaign_strategy.review_notes];

  if (isAdjacent) {
    riskFlags.push("Adjacent fit. Human review required.");
    reviewNotes.push("Do not treat this as a strong-fit vertical campaign.");
  }

  if (sensitive) {
    reviewNotes.push("Keep all claims public, non-sensitive, and human-reviewed.");
  }

  if (value.metadata.search_quality !== "live") {
    reviewNotes.push("Live search context was limited; validate company facts before external use.");
  }

  return {
    ...value,
    campaign_strategy: {
      ...value.campaign_strategy,
      campaign_confidence: isAdjacent ? Math.min(value.campaign_strategy.campaign_confidence, 4) : value.campaign_strategy.campaign_confidence,
      human_review_required: true,
      review_notes: Array.from(new Set(reviewNotes)),
      risk_flags: Array.from(new Set(riskFlags))
    },
    metadata: {
      ...value.metadata,
      human_review_required: true
    },
    risks_or_flags: Array.from(new Set([...riskFlags, ...reviewNotes])).join(" ")
  };
}

export async function runCampaignBriefAgent(companyName: string): Promise<CampaignBrief> {
  const companyContext = await searchCompany(companyName);
  let fallbackUsed = false;

  let verticalDetection: VerticalDetection;
  try {
    const verticalRaw = await generateJson(verticalDetectionPrompt(companyName, companyContext));
    verticalDetection = verticalDetectionSchema.parse(verticalRaw);
  } catch {
    fallbackUsed = true;
    verticalDetection = detectVerticalFallback(companyName, companyContext.summary);
  }

  const detectedVertical: PlanetVerticalName = isPlanetVertical(verticalDetection.detected_vertical)
    ? verticalDetection.detected_vertical
    : OTHER_VERTICAL;

  const retrievedContent = retrievePlanetContext(
    `${companyName} ${companyContext.summary}`,
    detectedVertical
  );
  const retrievedContext = formatVerticalContext(retrievedContent);
  const campaignPatterns = retrieveCampaignPatterns(detectedVertical);
  const campaignPatternContext = formatCampaignPatterns(campaignPatterns);

  let campaignStrategy: CampaignStrategy;
  try {
    const strategyRaw = await generateJson(
      campaignStrategyPrompt({
        companyName,
        detectedVertical,
        companyContext,
        verticalClassification: stringifyForPrompt(verticalDetection),
        retrievedContext,
        campaignPatterns: campaignPatternContext
      })
    );
    campaignStrategy = campaignStrategySchema.parse(strategyRaw);
  } catch {
    fallbackUsed = true;
    campaignStrategy = fallbackCampaignStrategy({
      companyName,
      classification: verticalDetection,
      retrievedContent,
      patterns: campaignPatterns
    });
  }

  let campaignEval: CampaignEval;
  try {
    const evalRaw = await generateJson(
      campaignEvalPrompt({
        companyContext,
        verticalClassification: stringifyForPrompt(verticalDetection),
        retrievedContext,
        campaignPatterns: campaignPatternContext,
        campaignStrategy: stringifyForPrompt(campaignStrategy)
      })
    );
    campaignEval = campaignEvalSchema.parse(evalRaw);
  } catch {
    fallbackUsed = true;
    campaignEval = fallbackEval(detectedVertical === OTHER_VERTICAL);
  }

  const humanReviewRequired =
    verticalDetection.manual_review_required ||
    campaignStrategy.human_review_required ||
    campaignEval.human_review_required ||
    companyContext.searchQuality !== "live" ||
    fallbackUsed;

  const result: CampaignBrief = {
    company_name: companyName,
    detected_vertical: detectedVertical,
    account_context: {
      summary: companyContext.summary,
      search_quality: companyContext.searchQuality,
      evidence: companyContext.snippets
    },
    vertical_detection: verticalDetection,
    campaign_strategy: campaignStrategy,
    campaign_eval: campaignEval,
    evidence: {
      company_context: companyContext.snippets,
      retrieved_planet_content: retrievedContent,
      campaign_patterns: campaignPatterns
    },
    metadata: {
      model: GEMINI_MODEL,
      search_quality: companyContext.searchQuality,
      generated_at: new Date().toISOString(),
      human_review_required: humanReviewRequired,
      fallback_used: fallbackUsed
    },
    company_overview: companyContext.summary.split("\n")[0] ?? `${companyName} account context.`,
    planet_use_case: campaignStrategy.campaign_opportunity.planet_value,
    planet_fit_score: verticalDetection.fit_score,
    fit_rationale: verticalDetection.classification_rationale,
    campaign_angle: campaignStrategy.recommended_campaign.campaign_angle,
    suggested_next_action: campaignStrategy.content_assets.sales_enablement_blurb,
    risks_or_flags: [...verticalDetection.classification_warnings, ...campaignStrategy.risk_flags].join(" "),
    eval_scores: {
      relevance: campaignEval.account_relevance,
      specificity: campaignEval.campaign_specificity,
      groundedness: campaignEval.groundedness,
      actionability: campaignEval.actionability,
      total: Math.round(campaignEval.total_score / 2),
      flag: campaignEval.human_review_required,
      eval_notes: campaignEval.final_recommendation
    }
  };

  return enforceSafety(result);
}
