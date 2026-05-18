"use client";

import { CampaignBrief } from "@/lib/types";

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="scoreRow">
      <div className="scoreLabel">
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>
      <div className="scoreTrack">
        <div className="scoreFill" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items.length) return <p className="mutedText">No items returned.</p>;

  return (
    <div className="tagList">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return <p className="mutedText">No items returned.</p>;

  return (
    <ul className="bulletList">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function BriefView({ brief }: { brief: CampaignBrief }) {
  const strategy = brief.campaign_strategy;
  const evaluation = brief.campaign_eval;
  const adjacent = brief.detected_vertical === "Other / Adjacent / Manual Review";

  return (
    <section className="resultGrid" aria-live="polite">
      <div className="resultHero">
        <div>
          <p className="eyebrow">Campaign recommendation</p>
          <h2>{strategy.recommended_campaign.campaign_name}</h2>
          <p>{strategy.recommended_campaign.primary_message}</p>
        </div>
        <div className="metrics">
          <div>
            <span>Vertical</span>
            <strong>{brief.detected_vertical}</strong>
          </div>
          <div>
            <span>Fit</span>
            <strong>{brief.vertical_detection.fit_score}/10</strong>
          </div>
          <div>
            <span>Eval</span>
            <strong>{evaluation.total_score}/40</strong>
          </div>
          <div className={brief.metadata.human_review_required ? "reviewFlag warn" : "reviewFlag"}>
            <span>Status</span>
            <strong>{adjacent ? "Adjacent Review" : brief.metadata.human_review_required ? "Review" : "Ready"}</strong>
          </div>
        </div>
      </div>

      <article className={`panel ${adjacent ? "warningPanel" : "primaryPanel"}`}>
        <p className="eyebrow">Classification safety</p>
        <h3>{adjacent ? "Adjacent fit. Human review required." : brief.detected_vertical}</h3>
        <p>{brief.vertical_detection.classification_rationale}</p>
        <div className="miniMetrics">
          <span>Confidence {brief.vertical_detection.vertical_confidence}/10</span>
          <span>Fit {brief.vertical_detection.fit_score}/10</span>
        </div>
        <BulletList items={brief.vertical_detection.classification_warnings} />
      </article>

      <article className="panel">
        <p className="eyebrow">Matched Planet pattern</p>
        <h3>{strategy.matched_planet_campaign_pattern.pattern_name}</h3>
        <p>{strategy.matched_planet_campaign_pattern.why_this_pattern_matches}</p>
        <TagList items={strategy.matched_planet_campaign_pattern.planet_style_notes} />
      </article>

      <article className="panel primaryPanel">
        <p className="eyebrow">Recommended campaign</p>
        <h3>{strategy.recommended_campaign.campaign_angle}</h3>
        <p>{strategy.recommended_campaign.one_line_pitch}</p>
        <div className="campaignCallout">
          <span>CTA</span>
          <strong>{strategy.recommended_campaign.cta}</strong>
        </div>
        <p className="notes">{strategy.recommended_campaign.offer}</p>
      </article>

      <article className="panel">
        <p className="eyebrow">Campaign opportunity</p>
        <dl className="detailList">
          <div>
            <dt>Buyer pain</dt>
            <dd>{strategy.campaign_opportunity.buyer_pain}</dd>
          </div>
          <div>
            <dt>Planet value</dt>
            <dd>{strategy.campaign_opportunity.planet_value}</dd>
          </div>
          <div>
            <dt>Business outcome</dt>
            <dd>{strategy.campaign_opportunity.business_outcome}</dd>
          </div>
        </dl>
      </article>

      <article className="panel">
        <p className="eyebrow">Target audience</p>
        <h3>Primary audience</h3>
        <TagList items={strategy.targeting.primary_audience} />
        <h3>Buyer personas</h3>
        <TagList items={strategy.targeting.buyer_personas} />
        <h3>Signals to watch</h3>
        <BulletList items={strategy.targeting.account_signals_to_watch} />
      </article>

      <article className="panel copyPanel">
        <p className="eyebrow">Copy starters</p>
        <div className="copyBlock">
          <span>Landing page headline</span>
          <strong>{strategy.content_assets.landing_page_headline}</strong>
          <p>{strategy.content_assets.landing_page_subheadline}</p>
        </div>
        <div className="copyBlock">
          <span>LinkedIn ad</span>
          <p>{strategy.content_assets.linkedin_ad_copy}</p>
        </div>
        <div className="copyBlock">
          <span>Email subject lines</span>
          <BulletList items={strategy.content_assets.email_subject_lines} />
        </div>
        <div className="copyBlock">
          <span>Sales handoff note</span>
          <p>{strategy.content_assets.sales_enablement_blurb}</p>
        </div>
      </article>

      <article className="panel">
        <p className="eyebrow">Experiment plan</p>
        <p>{strategy.experiment_plan.hypothesis}</p>
        <div className="variantGrid">
          <div>
            <span>Variant A</span>
            <strong>{strategy.experiment_plan.variant_a}</strong>
          </div>
          <div>
            <span>Variant B</span>
            <strong>{strategy.experiment_plan.variant_b}</strong>
          </div>
        </div>
        <p className="notes">Success: {strategy.experiment_plan.success_metric}</p>
        <p className="notes">Guardrail: {strategy.experiment_plan.guardrail_metric}</p>
      </article>

      <article className="panel">
        <p className="eyebrow">GTM impact</p>
        <dl className="detailList">
          <div>
            <dt>Primary KPI</dt>
            <dd>{strategy.gtm_impact.primary_kpi}</dd>
          </div>
          <div>
            <dt>Time saved</dt>
            <dd>{strategy.gtm_impact.how_this_saves_time}</dd>
          </div>
          <div>
            <dt>Sales handoff</dt>
            <dd>{strategy.gtm_impact.how_this_improves_sales_handoff}</dd>
          </div>
        </dl>
        <TagList items={strategy.gtm_impact.secondary_kpis} />
      </article>

      <article className="panel">
        <p className="eyebrow">Evaluation</p>
        <ScoreBar label="Account relevance" value={evaluation.account_relevance} max={5} />
        <ScoreBar label="Planet fit" value={evaluation.planet_fit} max={5} />
        <ScoreBar label="Specificity" value={evaluation.campaign_specificity} max={5} />
        <ScoreBar label="Planet voice" value={evaluation.planet_voice_alignment} max={5} />
        <ScoreBar label="Groundedness" value={evaluation.groundedness} max={5} />
        <ScoreBar label="Actionability" value={evaluation.actionability} max={5} />
        <ScoreBar label="GTM impact" value={evaluation.gtm_impact} max={5} />
        <ScoreBar label="Classification safety" value={evaluation.classification_safety} max={5} />
        <p className="notes">{evaluation.final_recommendation}</p>
      </article>

      <article className="panel evidencePanel">
        <p className="eyebrow">Evidence used</p>
        <div className="evidenceList">
          {brief.evidence.company_context.map((item) => (
            <a href={item.url} target="_blank" rel="noreferrer" key={`${item.title}-${item.url}`}>
              <span>{item.source}</span>
              <strong>{item.title}</strong>
              <p>{item.snippet}</p>
            </a>
          ))}
        </div>
      </article>
    </section>
  );
}
