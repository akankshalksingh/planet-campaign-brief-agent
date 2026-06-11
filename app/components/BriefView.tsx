"use client";

import Link from "next/link";
import { CampaignBrief } from "@/lib/types";

function compactList(items: string[], limit = 4) {
  return items.filter(Boolean).slice(0, limit);
}

function getReviewStatus(brief: CampaignBrief) {
  if (brief.detected_vertical === "Other / Adjacent / Manual Review") return "Manual review";
  return brief.metadata.human_review_required || brief.campaign_eval.human_review_required ? "Review" : "Ready";
}

function buildBuilderHref(brief: CampaignBrief) {
  const strategy = brief.campaign_strategy;
  const params = new URLSearchParams({
    campaignIdea: strategy.recommended_campaign.campaign_theme,
    targetVertical: brief.detected_vertical,
    targetAudience: compactList(strategy.targeting.buyer_personas, 4).join(", "),
    campaignGoal: strategy.recommended_campaign.offer,
    primaryCTA: strategy.recommended_campaign.cta,
    notes: `${brief.company_name}: ${strategy.campaign_opportunity.business_outcome}`
  });

  return `/campaign-builder?${params.toString()}`;
}

function ScoreRow({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div className="compactScoreRow">
      <span>{label}</span>
      <strong>
        {value}/{max}
      </strong>
    </div>
  );
}

export function BriefView({ brief }: { brief: CampaignBrief }) {
  const strategy = brief.campaign_strategy;
  const evaluation = brief.campaign_eval;
  const status = getReviewStatus(brief);
  const evidence = brief.evidence.company_context.filter((item) => item.title || item.snippet);
  const evidenceCount = evidence.length;
  const personas = compactList(strategy.targeting.buyer_personas.length ? strategy.targeting.buyer_personas : strategy.targeting.primary_audience);
  const evaluationSummary = evaluation.final_recommendation || strategy.campaign_confidence_reason;
  const humanReviewRequired = status !== "Ready";

  return (
    <section className="accountDecision" aria-live="polite">
      <article className="decisionHero primaryPanel">
        <div>
          <p className="eyebrow">Campaign recommendation</p>
          <h2>{strategy.recommended_campaign.campaign_name}</h2>
          <p>{strategy.recommended_campaign.primary_message}</p>
        </div>
        <dl className="decisionMetricGrid">
          <div>
            <dt>Vertical</dt>
            <dd>{brief.detected_vertical}</dd>
          </div>
          <div>
            <dt>Fit</dt>
            <dd>{brief.vertical_detection.fit_score}/10</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd>{brief.vertical_detection.vertical_confidence}/10</dd>
          </div>
          <div className={humanReviewRequired ? "warn" : ""}>
            <dt>Status</dt>
            <dd>{status}</dd>
          </div>
        </dl>
      </article>

      <article className="decisionPanel">
        <p className="eyebrow">Account summary</p>
        <h3>{brief.company_name}</h3>
        <p>{brief.account_context.summary || brief.company_overview}</p>
        <dl className="inlineFacts">
          <div><dt>Vertical</dt><dd>{brief.detected_vertical}</dd></div>
          <div><dt>Fit</dt><dd>{brief.vertical_detection.fit_score}/10</dd></div>
          <div><dt>Confidence</dt><dd>{brief.vertical_detection.vertical_confidence}/10</dd></div>
          <div><dt>Status</dt><dd>{status}</dd></div>
        </dl>
      </article>

      <article className="decisionPanel">
        <p className="eyebrow">Why this account fits</p>
        <div className="fitColumns">
          <div>
            <h3>Account need</h3>
            <p>{strategy.campaign_opportunity.buyer_pain}</p>
          </div>
          <div>
            <h3>Planet opportunity</h3>
            <p>{strategy.campaign_opportunity.planet_value}</p>
          </div>
        </div>
        <dl className="inlineFacts">
          <div><dt>Matched pattern</dt><dd>{strategy.matched_planet_campaign_pattern.pattern_name}</dd></div>
          <div><dt>Business outcome</dt><dd>{strategy.campaign_opportunity.business_outcome}</dd></div>
        </dl>
      </article>

      <article className="decisionPanel campaignDirection">
        <p className="eyebrow">Recommended campaign direction</p>
        <h3>{strategy.recommended_campaign.campaign_theme}</h3>
        <p>{strategy.recommended_campaign.one_line_pitch}</p>
        <dl className="detailList">
          {personas.length ? (
            <div>
              <dt>Primary buyer personas</dt>
              <dd>{personas.join(", ")}</dd>
            </div>
          ) : null}
          <div>
            <dt>Primary CTA</dt>
            <dd>{strategy.recommended_campaign.cta}</dd>
          </div>
          <div>
            <dt>Recommended business outcome</dt>
            <dd>{strategy.campaign_opportunity.business_outcome}</dd>
          </div>
          <div>
            <dt>Suggested next step</dt>
            <dd>Build a campaign package for {brief.company_name} using this vertical, message, audience, and CTA.</dd>
          </div>
        </dl>
        <Link className="primaryAction" href={buildBuilderHref(brief)}>
          Continue to Campaign Builder
        </Link>
      </article>

      <article className="decisionPanel qualityPanel">
        <p className="eyebrow">Quality and evidence</p>
        <h3>
          Quality check: {evaluation.total_score}/40 — {humanReviewRequired ? "Review recommended" : "Ready for review"}
        </h3>
        <p>{evaluationSummary}</p>
        <ul className="compactBullets">
          {compactList(evaluation.top_strengths, 2).map((item) => <li key={item}>{item}</li>)}
          {compactList(evaluation.top_gaps, 1).map((item) => <li key={item}>{item}</li>)}
          <li>{humanReviewRequired ? "Human approval is required before external use." : "Human review is still recommended before launch."}</li>
        </ul>
        <dl className="inlineFacts">
          <div><dt>Evidence sources</dt><dd>{evidenceCount}</dd></div>
          <div><dt>Human-review flag</dt><dd>{humanReviewRequired ? "Required" : "Recommended"}</dd></div>
        </dl>

        <details className="compactDetails">
          <summary>View detailed evaluation</summary>
          <div className="compactScoreGrid">
            <ScoreRow label="Account relevance" value={evaluation.account_relevance} />
            <ScoreRow label="Planet fit" value={evaluation.planet_fit} />
            <ScoreRow label="Specificity" value={evaluation.campaign_specificity} />
            <ScoreRow label="Planet voice" value={evaluation.planet_voice_alignment} />
            <ScoreRow label="Groundedness" value={evaluation.groundedness} />
            <ScoreRow label="Actionability" value={evaluation.actionability} />
            <ScoreRow label="GTM impact" value={evaluation.gtm_impact} />
            <ScoreRow label="Classification safety" value={evaluation.classification_safety} />
          </div>
        </details>

        {evidenceCount ? (
          <details className="compactDetails">
            <summary>View evidence used</summary>
            <div className="compactEvidenceList">
              {evidence.map((item) => (
                <a href={item.url} target="_blank" rel="noreferrer" key={`${item.title}-${item.url}`}>
                  <strong>{item.title}</strong>
                  <span>{item.snippet}</span>
                </a>
              ))}
            </div>
          </details>
        ) : null}
      </article>
    </section>
  );
}
