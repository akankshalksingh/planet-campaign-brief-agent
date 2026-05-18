import { generateJson, GEMINI_MODEL } from "@/lib/gemini";
import {
  formatCampaignPatterns,
  formatSeedAccountMatches,
  formatVerticalContext,
  matchSeedAccounts,
  retrieveCampaignIdeaPatterns,
  retrievePlanetContext
} from "@/lib/knowledge";
import { campaignIdeaEvalPrompt, campaignIdeaPrompt } from "@/lib/prompts";
import { campaignIdeaEvalSchema, campaignIdeaStrategySchema } from "@/lib/schemas";
import {
  CampaignGoal,
  CampaignIdeaEval,
  CampaignIdeaResult,
  CampaignIdeaStrategy,
  PlanetVerticalName,
  RelationshipType
} from "@/lib/types";
import { stringifyForPrompt } from "@/lib/json";

const OTHER: PlanetVerticalName = "Other / Adjacent / Manual Review";

const ideaRules: Array<{
  terms: string[];
  verticals: PlanetVerticalName[];
  campaignName: string;
  headline: string;
  cta: string;
}> = [
  {
    terms: ["disaster", "readiness", "response", "damage", "flood", "wildfire", "storm"],
    verticals: ["Government and Civil", "Insurance and Risk", "Environmental and Climate"],
    campaignName: "Disaster Season Readiness Intelligence",
    headline: "See disaster impact faster. Prioritize response sooner.",
    cta: "Request a disaster response workflow briefing"
  },
  {
    terms: ["crop", "stress", "field", "agriculture", "farm", "yield", "harvest"],
    verticals: ["Agriculture"],
    campaignName: "Crop Stress Early Warning",
    headline: "See crop change before it becomes crop loss.",
    cta: "Explore field monitoring with Planet"
  },
  {
    terms: ["dark", "vessel", "maritime", "ais", "port", "fishing", "ship"],
    verticals: ["Maritime", "Defense and Intelligence", "Government and Civil"],
    campaignName: "Maritime Awareness Beyond AIS",
    headline: "See activity traditional signals miss.",
    cta: "Book a maritime monitoring demo"
  },
  {
    terms: ["infrastructure", "superres", "ai-enhanced", "clarity", "monitoring", "utility"],
    verticals: ["Government and Civil", "Defense and Intelligence", OTHER],
    campaignName: "AI-Enhanced Infrastructure Monitoring",
    headline: "Frequency and clarity, without the usual tradeoff.",
    cta: "Register for a SuperRes workflow demo"
  },
  {
    terms: ["climate", "risk", "evidence", "exposure", "esg", "carbon"],
    verticals: ["Insurance and Risk", "Environmental and Climate", "Government and Civil"],
    campaignName: "Climate Risk Evidence Layer",
    headline: "Turn climate exposure into objective evidence.",
    cta: "Download the climate risk monitoring brief"
  },
  {
    terms: ["files", "answers", "platform", "insights", "data", "api", "workflow"],
    verticals: ["Government and Civil", "Environmental and Climate", OTHER],
    campaignName: "From Managing Files to Finding Answers",
    headline: "Move from managing files to finding answers.",
    cta: "Explore Planet Insights Platform"
  }
];

function inferIdeaRule(campaignIdea: string, optionalAccount: string) {
  const haystack = `${campaignIdea} ${optionalAccount}`.toLowerCase();
  const matched = ideaRules
    .map((rule) => ({
      rule,
      score: rule.terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0)
    }))
    .sort((a, b) => b.score - a.score)[0];

  return matched?.score ? matched.rule : {
    terms: [],
    verticals: [OTHER],
    campaignName: "Adjacent Campaign Fit Review",
    headline: "Validate the Earth intelligence fit before launch.",
    cta: "Validate campaign fit with GTM owner"
  };
}

function relationshipMotion(relationshipType: RelationshipType, campaignGoal: CampaignGoal) {
  if (relationshipType === "Existing customer") {
    if (campaignGoal === "Product adoption") return "adoption";
    if (campaignGoal === "Renewal support") return "renewal_support";
    return "expansion";
  }
  if (relationshipType === "Partner") return "executive_education";
  if (relationshipType === "Existing target account") {
    return campaignGoal === "Event follow-up" ? "event_follow_up" : "account_progression";
  }
  return "net_new_awareness";
}

function relationshipNotes(relationshipType: RelationshipType) {
  if (relationshipType === "Existing customer") {
    return [
      "Do not explain Planet from scratch.",
      "Use expansion, adoption, renewal support, or executive education language."
    ];
  }
  if (relationshipType === "Existing target account") {
    return ["Do not assume customer status.", "Use account progression, nurture, and sales handoff language."];
  }
  if (relationshipType === "Partner") {
    return ["Use co-marketing or enablement language.", "Validate partner permissions before external launch."];
  }
  if (relationshipType === "Unknown") {
    return ["Relationship is unknown; validate before launch.", "Keep claims conservative and require human review."];
  }
  return ["Use awareness, education, and qualification language."];
}

function buildFallbackStrategy(params: {
  campaignIdea: string;
  optionalTargetAccount: string;
  relationshipType: RelationshipType;
  campaignGoal: CampaignGoal;
}): CampaignIdeaStrategy {
  const rule = inferIdeaRule(params.campaignIdea, params.optionalTargetAccount);
  const matches = matchSeedAccounts(params.campaignIdea, rule.verticals, params.optionalTargetAccount);
  const patterns = retrieveCampaignIdeaPatterns(params.campaignIdea, rule.verticals);
  const primaryPattern = patterns[0];
  const primaryAccounts = matches.map((item) => item.account.name);
  const isAdjacent = rule.verticals.includes(OTHER);
  const motion = relationshipMotion(params.relationshipType, params.campaignGoal);
  const notes = relationshipNotes(params.relationshipType);

  return campaignIdeaStrategySchema.parse({
    campaign_idea_strategy: {
      campaign_idea: params.campaignIdea,
      optional_target_account: params.optionalTargetAccount,
      relationship_type: params.relationshipType,
      campaign_goal: params.campaignGoal,
      fit_assessment: {
        recommended_verticals: rule.verticals.map((vertical, index) => ({
          vertical,
          fit_score: vertical === OTHER ? 5 : Math.max(6, 9 - index),
          why_it_fits:
            vertical === OTHER
              ? "This idea has adjacent mapping, infrastructure, or workflow relevance but needs GTM validation."
              : `The idea maps to ${vertical} because it aligns with Planet use cases and curated campaign patterns.`,
          confidence: vertical === OTHER ? "low" : index === 0 ? "high" : "medium"
        })),
        not_recommended_verticals: ["Agriculture", "Maritime", "Finance and Commodities", "Government and Civil"]
          .filter((vertical) => !rule.verticals.includes(vertical as PlanetVerticalName))
          .slice(0, 3)
          .map((vertical) => ({
            vertical: vertical as PlanetVerticalName,
            reason: `Not a primary fit for "${params.campaignIdea}" without stronger evidence.`
          })),
        overall_confidence: isAdjacent ? "medium" : "high",
        manual_review_required: isAdjacent || params.relationshipType === "Unknown"
      },
      account_recommendations: matches.map(({ account, score }) => ({
        account_name: account.name,
        vertical: account.vertical,
        relationship_type:
          params.optionalTargetAccount && account.name.toLowerCase().includes(params.optionalTargetAccount.toLowerCase())
            ? params.relationshipType
            : account.relationshipType,
        fit_score: score,
        why_target_this_account: account.fitNotes,
        suggested_motion: account.suggestedMotions[0] ?? "account review",
        review_risk: account.reviewRequired ? "Human review required before external use." : "Low review risk after fact validation."
      })),
      existing_account_strategy: {
        is_existing_account_motion: ["Existing target account", "Existing customer", "Partner"].includes(params.relationshipType),
        do_not_treat_as_net_new: ["Existing target account", "Existing customer", "Partner"].includes(params.relationshipType),
        recommended_motion: motion,
        relationship_risk_notes: notes,
        next_best_action:
          params.relationshipType === "Existing customer"
            ? "Coordinate with the account team and frame this as expansion or adoption, not net-new prospecting."
            : params.relationshipType === "Existing target account"
              ? "Package this as account progression with sales handoff and an invite-only briefing."
              : params.relationshipType === "Partner"
                ? "Validate co-marketing permissions and build an enablement-first motion."
                : "Validate relationship status and route to the appropriate GTM owner."
      },
      gtm_strategy: {
        campaign_name: rule.campaignName,
        campaign_theme: primaryPattern?.hook_type ?? "Account-to-campaign GTM planning",
        primary_message: primaryPattern?.core_message ?? "Map a campaign idea to the right Planet accounts and motion.",
        one_line_pitch: rule.headline,
        buyer_pain: primaryPattern?.buyer_pains[0] ?? "The campaign idea needs a validated Planet use case before launch.",
        planet_value: primaryPattern?.planet_capabilities.join(", ") ?? "Daily monitoring, change detection, and workflow intelligence",
        business_outcome: primaryPattern?.business_outcomes[0] ?? "Better campaign prioritization and sales handoff",
        cta: rule.cta,
        offer:
          params.relationshipType === "Existing customer"
            ? "Executive adoption or expansion briefing"
            : params.relationshipType === "Existing target account"
              ? "Invite-only account progression briefing"
              : "Vertical-specific education asset"
      },
      targeting: {
        best_fit_accounts: primaryAccounts,
        primary_personas: Array.from(new Set(matches.flatMap((item) => item.account.personas))).slice(0, 6),
        secondary_personas: ["Growth marketing", "Sales engineering", "Account executive", "Solutions consultant"],
        account_signals_to_watch: Array.from(new Set(matches.flatMap((item) => item.account.accountSignals))).slice(0, 8),
        disqualification_flags: Array.from(new Set(matches.flatMap((item) => item.account.disqualificationFlags))).slice(0, 6)
      },
      channel_strategy: {
        recommended_channels: [
          {
            channel: "Direct email nurture",
            why_this_channel: "Best for relationship-aware account progression and targeted education.",
            best_for: "Known accounts and qualified personas",
            priority: "high"
          },
          {
            channel: "Invite-only webinar or workflow demo",
            why_this_channel: "Lets Planet show the use case without overclaiming external proof.",
            best_for: "Technical and executive stakeholders",
            priority: "high"
          },
          {
            channel: "Sales handoff brief",
            why_this_channel: "Turns campaign strategy into a usable account-team next step.",
            best_for: "Account progression and sales acceptance",
            priority: "high"
          },
          {
            channel: "Broad paid social",
            why_this_channel: "Useful only after vertical fit and audience are validated.",
            best_for: "Awareness",
            priority: isAdjacent ? "low" : "medium"
          }
        ],
        channels_to_avoid: [
          {
            channel: "Generic outbound blast",
            reason: "The campaign depends on vertical fit and relationship-aware messaging."
          }
        ]
      },
      copy_starters: {
        landing_page_headline: rule.headline,
        landing_page_subheadline: primaryPattern?.core_message ?? "Turn a campaign idea into account-specific GTM action.",
        linkedin_ad_copy: `${primaryPattern?.buyer_pains[0] ?? "Campaign planning gets slow when teams start from scratch."} Planet GTM intelligence maps the idea to verticals, accounts, channels, copy, and KPIs before launch.`,
        email_subject_lines: [
          rule.headline,
          `${params.campaignIdea}: account strategy starter`,
          `A Planet GTM motion for ${params.campaignIdea}`
        ],
        email_body_short: `Here is a review-ready GTM motion for ${params.campaignIdea}: target ${rule.verticals.join(", ")}, prioritize ${primaryAccounts.slice(0, 3).join(", ") || "validated accounts"}, and measure ${params.campaignGoal.toLowerCase()}.`,
        sales_handoff_note: `Use this campaign as a ${motion.replace(/_/g, " ")} motion. Validate relationship status and approved proof points before external use.`,
        webinar_or_event_title: `${params.campaignIdea}: from signal to action`,
        nurture_sequence_idea: "Start with the business pain, follow with a workflow demo, then route engaged accounts to sales with proof points and review flags."
      },
      experiment_plan: {
        hypothesis: `${primaryPattern?.hook_type ?? "Outcome-led messaging"} will outperform generic satellite imagery messaging for this audience.`,
        variant_a_message: rule.headline,
        variant_b_message: primaryPattern?.reusable_hooks[1] ?? "Satellite intelligence for faster decisions.",
        success_metric:
          params.campaignGoal === "Product adoption"
            ? "product-qualified conversations"
            : params.campaignGoal === "Expansion"
              ? "expansion conversations"
              : "MQL-to-SQL conversion",
        guardrail_metric: "human review approval rate",
        learning_goal: "Learn whether outcome-led or capability-led messaging creates stronger account progression."
      },
      gtm_impact: {
        how_this_saves_time: "Reduces manual campaign planning by mapping one idea to verticals, accounts, personas, channels, and copy starters.",
        how_this_improves_lead_quality: "Prioritizes accounts where buyer pain, Planet capability, and campaign goal align.",
        how_this_improves_sales_handoff: "Packages the motion, proof points, personas, and relationship risks into a sales-ready brief.",
        primary_kpi:
          params.campaignGoal === "Expansion"
            ? "expansion conversations"
            : params.campaignGoal === "Product adoption"
              ? "product-qualified conversations"
              : "campaign idea-to-launch time",
        secondary_kpis: ["sales acceptance rate", "MQL-to-SQL conversion", "campaign-sourced pipeline", "AI output approval rate"]
      },
      review_flags: {
        human_review_required: isAdjacent || params.relationshipType === "Unknown" || ["Government and Civil", "Defense and Intelligence"].some((vertical) => rule.verticals.includes(vertical as PlanetVerticalName)),
        claims_to_validate: ["account relationship status", "approved proof points", "safe public-sector or defense wording"],
        safe_to_use_externally: false,
        notes: isAdjacent
          ? ["Weak or adjacent fit. Validate with GTM owner before launch."]
          : ["Human review required before external campaign use."]
      }
    }
  });
}

function buildFallbackEval(strategy: CampaignIdeaStrategy): CampaignIdeaEval {
  const reviewRequired = strategy.campaign_idea_strategy.review_flags.human_review_required;
  const hasAdjacent = strategy.campaign_idea_strategy.fit_assessment.recommended_verticals.some(
    (item) => item.vertical === OTHER
  );

  return campaignIdeaEvalSchema.parse({
    campaign_idea_eval: {
      idea_to_vertical_fit: hasAdjacent ? 3 : 5,
      account_targeting_quality: strategy.campaign_idea_strategy.account_recommendations.length ? 4 : 2,
      relationship_awareness: 5,
      planet_voice_alignment: 4,
      channel_strategy: 4,
      copy_usefulness: 4,
      gtm_impact: 4,
      safety_and_review_quality: reviewRequired ? 5 : 4,
      total_score: 33,
      max_score: 40,
      quality_band: "usable_with_edits",
      human_review_required: reviewRequired,
      top_strengths: ["Relationship-aware GTM motion", "Local seed account matching", "Campaign-ready copy starters"],
      top_gaps: hasAdjacent ? ["Adjacent fit needs GTM validation"] : ["Validate proof points before launch"],
      specific_improvements: ["Add CRM engagement history and real campaign performance once available"],
      final_recommendation: reviewRequired
        ? "Use as a reviewed GTM strategy starter, not external-ready copy."
        : "Usable as a campaign planning starter with standard human review."
    }
  });
}

export async function runCampaignIdeaAgent(params: {
  campaignIdea: string;
  optionalTargetAccount: string;
  relationshipType: RelationshipType;
  campaignGoal: CampaignGoal;
}): Promise<CampaignIdeaResult> {
  const rule = inferIdeaRule(params.campaignIdea, params.optionalTargetAccount);
  const verticalContext = rule.verticals
    .filter((vertical) => vertical !== OTHER)
    .flatMap((vertical) => retrievePlanetContext(params.campaignIdea, vertical))
    .slice(0, 4);
  const campaignPatterns = retrieveCampaignIdeaPatterns(params.campaignIdea, rule.verticals);
  const accountMatches = matchSeedAccounts(params.campaignIdea, rule.verticals, params.optionalTargetAccount);
  const fallbackStrategy = buildFallbackStrategy(params);
  let fallbackUsed = false;

  let strategy: CampaignIdeaStrategy;
  try {
    const raw = await generateJson(
      campaignIdeaPrompt({
        campaignIdea: params.campaignIdea,
        optionalTargetAccount: params.optionalTargetAccount,
        relationshipType: params.relationshipType,
        campaignGoal: params.campaignGoal,
        retrievedVerticalContext: formatVerticalContext(verticalContext),
        retrievedCampaignPatterns: formatCampaignPatterns(campaignPatterns),
        accountMatches: formatSeedAccountMatches(accountMatches)
      })
    );
    strategy = campaignIdeaStrategySchema.parse(raw);
  } catch {
    fallbackUsed = true;
    strategy = fallbackStrategy;
  }

  let evaluation: CampaignIdeaEval;
  try {
    const rawEval = await generateJson(
      campaignIdeaEvalPrompt({
        campaignIdea: params.campaignIdea,
        relationshipType: params.relationshipType,
        campaignGoal: params.campaignGoal,
        strategy: stringifyForPrompt(strategy)
      })
    );
    evaluation = campaignIdeaEvalSchema.parse(rawEval);
  } catch {
    fallbackUsed = true;
    evaluation = buildFallbackEval(strategy);
  }

  return {
    ...strategy,
    campaign_idea_eval: evaluation.campaign_idea_eval,
    metadata: {
      model: GEMINI_MODEL,
      generated_at: new Date().toISOString(),
      fallback_used: fallbackUsed,
      human_review_required:
        strategy.campaign_idea_strategy.review_flags.human_review_required ||
        evaluation.campaign_idea_eval.human_review_required ||
        fallbackUsed
    }
  };
}
