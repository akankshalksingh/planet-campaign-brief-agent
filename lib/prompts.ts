import { CompanyContext, PlanetVerticalName } from "@/lib/types";

const supportedVerticals = `1. Agriculture
2. Defense and Intelligence
3. Insurance and Risk
4. Environmental and Climate
5. Maritime
6. Finance and Commodities
7. Government and Civil
8. Other / Adjacent / Manual Review`;

export function verticalDetectionPrompt(companyName: string, companyContext: CompanyContext) {
  return `You are a strict GTM vertical classifier for Planet.

Classify the target account into a Planet vertical only when there is clear evidence.
Do not force a company into a vertical. If no supported Planet vertical clearly fits, return "Other / Adjacent / Manual Review".

Supported verticals:
${supportedVerticals}

Definitions and exclusions:
- Agriculture: crop science, farming, agronomy, precision agriculture, crop monitoring, food production, seed, pest/disease detection, irrigation, yield prediction, or farm management.
- Defense and Intelligence: defense contractors, intelligence agencies, military organizations, national security organizations, ISR, surveillance, geospatial intelligence, or strategic monitoring.
- Insurance and Risk: insurers, reinsurers, catastrophe modeling, risk platforms, claims monitoring, disaster damage assessment, property risk, climate risk underwriting, or loss modeling.
- Environmental and Climate: conservation, sustainability, ESG reporting, forestry, biodiversity, carbon, methane, deforestation, land-use change, or climate monitoring.
- Maritime: ports, shipping, coast guards, maritime intelligence, fisheries, ocean monitoring, vessel tracking, AIS gaps, dark vessels, or port/ocean supply chain visibility.
- Finance and Commodities: hedge funds, commodity traders, financial research, market intelligence, alternative data, economic indicators, commodity production, mining, ports, or agriculture output for investment decisions.
- Government and Civil: public-sector agencies, civil government departments, municipalities, disaster response agencies, urban planning, NASA, NOAA, FEMA, public infrastructure, or public research.
- Other / Adjacent / Manual Review: commercial technology, consumer, mobility, retail, software, advertising, marketplaces, or general enterprise companies unless there is strong evidence for one supported Planet vertical.

Critical rules:
- Do not classify a company as Government and Civil just because it operates in cities.
- Do not classify Uber as Government and Civil.
- Do not classify Apple, Google, Meta, Microsoft, Amazon, Walmart, or Uber as Government and Civil unless research is specifically about a public-sector division or government agency context.
- Do not classify a company as Maritime just because it has logistics. Maritime requires ports, vessels, ocean shipping, fisheries, coast guard, or maritime domain awareness.
- Do not classify a company as Finance and Commodities just because it is public or large.
- If evidence is weak, lower confidence and choose Other / Adjacent / Manual Review.

Target account:
${companyName}

Company research:
${companyContext.summary}

Search snippets:
${companyContext.snippets.map((item, index) => `${index + 1}. ${item.title}: ${item.snippet}`).join("\n")}

Return valid JSON only:
{
  "detected_vertical": "",
  "vertical_confidence": 1,
  "fit_score": 1,
  "classification_rationale": "",
  "evidence_used": [],
  "why_not_other_verticals": {
    "Agriculture": "",
    "Defense and Intelligence": "",
    "Insurance and Risk": "",
    "Environmental and Climate": "",
    "Maritime": "",
    "Finance and Commodities": "",
    "Government and Civil": ""
  },
  "manual_review_required": true,
  "classification_warnings": []
}`;
}

export function campaignStrategyPrompt(params: {
  companyName: string;
  detectedVertical: PlanetVerticalName;
  companyContext: CompanyContext;
  verticalClassification: string;
  retrievedContext: string;
  campaignPatterns: string;
}) {
  return `You are a senior B2B growth marketing strategist and AI GTM systems architect for Planet.

Turn a target account into a campaign-ready recommendation for Planet's growth marketing team.
This is not generic copywriting. Ground the recommendation in:
1. The target company's real business context
2. The strict Planet vertical classification
3. Retrieved approved Planet messaging
4. Curated public Planet campaign patterns
5. Measurable GTM impact

Planet context:
Planet sells daily Earth observation data, analytics, APIs, and workflows that help customers detect change across agriculture, defense, government, insurance, climate, maritime, finance, infrastructure, and research use cases.

Rules:
- Do not invent customer relationships.
- Do not claim the company is a Planet customer unless the source explicitly says so.
- If source quality is weak, make the campaign conservative.
- If the account is "Other / Adjacent / Manual Review," do not pretend it is a strong fit; cap campaign_confidence at 4 and require human review.
- Use only public, non-sensitive language.
- Defense and government content must remain public and human-review oriented.
- Make the campaign feel like Planet: outcome-led, use-case driven, vertical-specific, technical but clear.
- Connect recommendations to campaign velocity, lead quality, sales handoff, MQL-to-SQL, or pipeline.

Target account:
${params.companyName}

Company research:
${params.companyContext.summary}

Vertical classification:
${params.verticalClassification}

Retrieved approved Planet context:
${params.retrievedContext}

Curated Planet campaign patterns:
${params.campaignPatterns}

Return valid JSON only:
{
  "campaign_confidence": 1,
  "campaign_confidence_reason": "",
  "matched_planet_campaign_pattern": {
    "pattern_name": "",
    "why_this_pattern_matches": "",
    "source_evidence_summary": [],
    "planet_style_notes": []
  },
  "campaign_opportunity": {
    "core_gap": "",
    "why_now": "",
    "buyer_pain": "",
    "planet_value": "",
    "business_outcome": ""
  },
  "recommended_campaign": {
    "campaign_name": "",
    "campaign_theme": "",
    "primary_message": "",
    "secondary_messages": [],
    "campaign_angle": "",
    "one_line_pitch": "",
    "cta": "",
    "offer": ""
  },
  "targeting": {
    "primary_audience": [],
    "secondary_audience": [],
    "buyer_personas": [],
    "account_signals_to_watch": [],
    "disqualification_flags": []
  },
  "content_assets": {
    "landing_page_headline": "",
    "landing_page_subheadline": "",
    "linkedin_ad_copy": "",
    "email_subject_lines": [],
    "email_body_short": "",
    "sales_enablement_blurb": "",
    "webinar_or_event_angle": "",
    "follow_up_sequence_idea": ""
  },
  "proof_points_to_use": [],
  "proof_points_to_avoid": [],
  "recommended_channels": [],
  "experiment_plan": {
    "hypothesis": "",
    "variant_a": "",
    "variant_b": "",
    "success_metric": "",
    "guardrail_metric": ""
  },
  "gtm_impact": {
    "how_this_saves_time": "",
    "how_this_improves_lead_quality": "",
    "how_this_improves_sales_handoff": "",
    "primary_kpi": "",
    "secondary_kpis": []
  },
  "human_review_required": true,
  "review_notes": [],
  "risk_flags": []
}`;
}

export function campaignEvalPrompt(params: {
  companyContext: CompanyContext;
  verticalClassification: string;
  retrievedContext: string;
  campaignPatterns: string;
  campaignStrategy: string;
}) {
  return `You are evaluating an AI-generated campaign recommendation for Planet's growth marketing team.

Score from 1 to 5:
1. Account relevance
2. Planet fit
3. Campaign specificity
4. Planet voice alignment
5. Groundedness
6. Actionability
7. GTM impact
8. Classification safety

Classification safety is critical: weak-fit accounts such as Uber should not be forced into Government and Civil.

Company context:
${params.companyContext.summary}

Vertical classification:
${params.verticalClassification}

Retrieved Planet content:
${params.retrievedContext}

Campaign patterns:
${params.campaignPatterns}

Campaign strategy:
${params.campaignStrategy}

Return valid JSON only:
{
  "account_relevance": 1,
  "planet_fit": 1,
  "campaign_specificity": 1,
  "planet_voice_alignment": 1,
  "groundedness": 1,
  "actionability": 1,
  "gtm_impact": 1,
  "classification_safety": 1,
  "total_score": 8,
  "max_score": 40,
  "quality_band": "weak",
  "human_review_required": true,
  "top_strengths": [],
  "top_gaps": [],
  "specific_improvements": [],
  "final_recommendation": ""
}`;
}

export function campaignIdeaPrompt(params: {
  campaignIdea: string;
  optionalTargetAccount: string;
  relationshipType: string;
  campaignGoal: string;
  retrievedVerticalContext: string;
  retrievedCampaignPatterns: string;
  accountMatches: string;
}) {
  return `You are a senior GTM strategist for Planet's growth marketing team.

Turn a campaign idea into a practical go-to-market strategy for Planet.
This is campaign planning for a space-data and Earth intelligence company, not generic copywriting.

Rules:
- Do not assume an account is an existing customer unless relationship type says so.
- If relationship type is Existing customer, do not pitch Planet from scratch. Recommend expansion, adoption, cross-sell, renewal support, or executive education.
- If relationship type is Existing target account, recommend account progression: education, nurture, sales handoff, event follow-up, or executive briefing.
- If relationship type is New prospect, recommend awareness, qualification, and low-friction CTA.
- If relationship type is Partner, recommend co-marketing, joint education, or enablement.
- If relationship type is Unknown, stay conservative and require human review.
- If the campaign idea does not clearly fit Planet's core verticals, classify it as Other / Adjacent / Manual Review.
- Do not force weak ideas into Government and Civil.
- For government, defense, and intelligence audiences, use public-safe language only.
- Use Planet-style language: outcome-led, use-case driven, focused on visibility, change detection, faster decisions, operational scale, and actionable intelligence.
- Connect every recommendation to GTM impact.
- Return valid JSON only.

CAMPAIGN_IDEA:
${params.campaignIdea}

OPTIONAL_TARGET_ACCOUNT:
${params.optionalTargetAccount || "None"}

RELATIONSHIP_TYPE:
${params.relationshipType}

CAMPAIGN_GOAL:
${params.campaignGoal}

RETRIEVED_VERTICAL_CONTEXT:
${params.retrievedVerticalContext}

RETRIEVED_CAMPAIGN_PATTERNS:
${params.retrievedCampaignPatterns}

ACCOUNT_MATCHES:
${params.accountMatches}

Return this exact JSON structure:
{
  "campaign_idea_strategy": {
    "campaign_idea": "",
    "optional_target_account": "",
    "relationship_type": "",
    "campaign_goal": "",
    "fit_assessment": {
      "recommended_verticals": [
        {
          "vertical": "",
          "fit_score": 0,
          "why_it_fits": "",
          "confidence": "high"
        }
      ],
      "not_recommended_verticals": [
        {
          "vertical": "",
          "reason": ""
        }
      ],
      "overall_confidence": "medium",
      "manual_review_required": true
    },
    "account_recommendations": [
      {
        "account_name": "",
        "vertical": "",
        "relationship_type": "",
        "fit_score": 0,
        "why_target_this_account": "",
        "suggested_motion": "",
        "review_risk": ""
      }
    ],
    "existing_account_strategy": {
      "is_existing_account_motion": true,
      "do_not_treat_as_net_new": true,
      "recommended_motion": "account_progression",
      "relationship_risk_notes": [],
      "next_best_action": ""
    },
    "gtm_strategy": {
      "campaign_name": "",
      "campaign_theme": "",
      "primary_message": "",
      "one_line_pitch": "",
      "buyer_pain": "",
      "planet_value": "",
      "business_outcome": "",
      "cta": "",
      "offer": ""
    },
    "targeting": {
      "best_fit_accounts": [],
      "primary_personas": [],
      "secondary_personas": [],
      "account_signals_to_watch": [],
      "disqualification_flags": []
    },
    "channel_strategy": {
      "recommended_channels": [
        {
          "channel": "",
          "why_this_channel": "",
          "best_for": "",
          "priority": "high"
        }
      ],
      "channels_to_avoid": [
        {
          "channel": "",
          "reason": ""
        }
      ]
    },
    "copy_starters": {
      "landing_page_headline": "",
      "landing_page_subheadline": "",
      "linkedin_ad_copy": "",
      "email_subject_lines": [],
      "email_body_short": "",
      "sales_handoff_note": "",
      "webinar_or_event_title": "",
      "nurture_sequence_idea": ""
    },
    "experiment_plan": {
      "hypothesis": "",
      "variant_a_message": "",
      "variant_b_message": "",
      "success_metric": "",
      "guardrail_metric": "",
      "learning_goal": ""
    },
    "gtm_impact": {
      "how_this_saves_time": "",
      "how_this_improves_lead_quality": "",
      "how_this_improves_sales_handoff": "",
      "primary_kpi": "",
      "secondary_kpis": []
    },
    "review_flags": {
      "human_review_required": true,
      "claims_to_validate": [],
      "safe_to_use_externally": false,
      "notes": []
    }
  }
}`;
}

export function campaignIdeaEvalPrompt(params: {
  campaignIdea: string;
  relationshipType: string;
  campaignGoal: string;
  strategy: string;
}) {
  return `You are evaluating an AI-generated GTM strategy for Planet's growth marketing team.

Score from 1 to 5:
1. Idea-to-vertical fit
2. Account targeting quality
3. Relationship awareness
4. Planet voice alignment
5. Channel strategy
6. Copy usefulness
7. GTM impact
8. Safety and review quality

Campaign idea: ${params.campaignIdea}
Relationship type: ${params.relationshipType}
Campaign goal: ${params.campaignGoal}

Strategy:
${params.strategy}

Return valid JSON only:
{
  "campaign_idea_eval": {
    "idea_to_vertical_fit": 1,
    "account_targeting_quality": 1,
    "relationship_awareness": 1,
    "planet_voice_alignment": 1,
    "channel_strategy": 1,
    "copy_usefulness": 1,
    "gtm_impact": 1,
    "safety_and_review_quality": 1,
    "total_score": 8,
    "max_score": 40,
    "quality_band": "weak",
    "human_review_required": true,
    "top_strengths": [],
    "top_gaps": [],
    "specific_improvements": [],
    "final_recommendation": ""
  }
}`;
}
