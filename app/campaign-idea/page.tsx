"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  CAMPAIGN_GOALS,
  CampaignGoal,
  CampaignIdeaResult,
  RELATIONSHIP_TYPES,
  RelationshipType
} from "@/lib/types";

const quickIdeas = [
  "Disaster Season Readiness",
  "Crop Stress Early Warning",
  "Dark Vessel Detection",
  "AI-Enhanced Infrastructure Monitoring",
  "Climate Risk Evidence Layer",
  "From Managing Files to Finding Answers"
];

function TagList({ items }: { items: string[] }) {
  if (!items.length) return <p className="mutedText">No recommendations returned.</p>;
  return (
    <div className="tagList">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return <p className="mutedText">No review notes returned.</p>;
  return (
    <ul className="bulletList">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="scoreRow">
      <div className="scoreLabel">
        <span>{label}</span>
        <strong>{value}/5</strong>
      </div>
      <div className="scoreTrack">
        <div className="scoreFill" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  );
}

function CampaignIdeaResults({ result }: { result: CampaignIdeaResult }) {
  const strategy = result.campaign_idea_strategy;
  const evaluation = result.campaign_idea_eval;

  return (
    <section className="resultGrid campaignIdeaResults">
      <div className="resultHero">
        <div>
          <p className="eyebrow">Campaign idea mapper</p>
          <h2>{strategy.gtm_strategy.campaign_name}</h2>
          <p>{strategy.gtm_strategy.primary_message}</p>
        </div>
        <div className="metrics">
          <div>
            <span>Confidence</span>
            <strong>{strategy.fit_assessment.overall_confidence}</strong>
          </div>
          <div>
            <span>Eval</span>
            <strong>{evaluation.total_score}/40</strong>
          </div>
          <div>
            <span>Relationship</span>
            <strong>{strategy.relationship_type}</strong>
          </div>
          <div className={result.metadata.human_review_required ? "reviewFlag warn" : "reviewFlag"}>
            <span>Status</span>
            <strong>{result.metadata.human_review_required ? "Review" : "Ready"}</strong>
          </div>
        </div>
      </div>

      <article className="panel primaryPanel">
        <p className="eyebrow">Recommended verticals</p>
        <div className="verticalFitList">
          {strategy.fit_assessment.recommended_verticals.map((item) => (
            <div key={item.vertical}>
              <strong>{item.vertical}</strong>
              <span>{item.fit_score}/10 · {item.confidence}</span>
              <p>{item.why_it_fits}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <p className="eyebrow">Best-fit accounts</p>
        <div className="accountList">
          {strategy.account_recommendations.map((account) => (
            <div key={account.account_name}>
              <strong>{account.account_name}</strong>
              <span>{account.vertical} · {account.fit_score}/10</span>
              <p>{account.why_target_this_account}</p>
              <p className="notes">{account.suggested_motion}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="panel warningPanel">
        <p className="eyebrow">Existing account strategy</p>
        <h3>{strategy.existing_account_strategy.recommended_motion.replace(/_/g, " ")}</h3>
        <p>{strategy.existing_account_strategy.next_best_action}</p>
        <BulletList items={strategy.existing_account_strategy.relationship_risk_notes} />
      </article>

      <article className="panel primaryPanel">
        <p className="eyebrow">GTM strategy</p>
        <h3>{strategy.gtm_strategy.one_line_pitch}</h3>
        <dl className="detailList">
          <div>
            <dt>Buyer pain</dt>
            <dd>{strategy.gtm_strategy.buyer_pain}</dd>
          </div>
          <div>
            <dt>Planet value</dt>
            <dd>{strategy.gtm_strategy.planet_value}</dd>
          </div>
          <div>
            <dt>CTA</dt>
            <dd>{strategy.gtm_strategy.cta}</dd>
          </div>
        </dl>
      </article>

      <article className="panel">
        <p className="eyebrow">Channel strategy</p>
        <div className="channelList">
          {strategy.channel_strategy.recommended_channels.map((channel) => (
            <div key={channel.channel}>
              <strong>{channel.channel}</strong>
              <span>{channel.priority}</span>
              <p>{channel.why_this_channel}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="panel copyPanel">
        <p className="eyebrow">Copy starters</p>
        <div className="copyBlock">
          <span>Landing page</span>
          <strong>{strategy.copy_starters.landing_page_headline}</strong>
          <p>{strategy.copy_starters.landing_page_subheadline}</p>
        </div>
        <div className="copyBlock">
          <span>LinkedIn ad</span>
          <p>{strategy.copy_starters.linkedin_ad_copy}</p>
        </div>
        <div className="copyBlock">
          <span>Email subject lines</span>
          <BulletList items={strategy.copy_starters.email_subject_lines} />
        </div>
        <div className="copyBlock">
          <span>Sales handoff</span>
          <p>{strategy.copy_starters.sales_handoff_note}</p>
        </div>
      </article>

      <article className="panel">
        <p className="eyebrow">Experiment plan</p>
        <p>{strategy.experiment_plan.hypothesis}</p>
        <div className="variantGrid">
          <div>
            <span>Variant A</span>
            <strong>{strategy.experiment_plan.variant_a_message}</strong>
          </div>
          <div>
            <span>Variant B</span>
            <strong>{strategy.experiment_plan.variant_b_message}</strong>
          </div>
        </div>
        <p className="notes">Success: {strategy.experiment_plan.success_metric}</p>
        <p className="notes">Learning: {strategy.experiment_plan.learning_goal}</p>
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

      <article className="panel warningPanel">
        <p className="eyebrow">Review flags</p>
        <h3>{strategy.review_flags.safe_to_use_externally ? "Ready after review" : "Not external-ready yet"}</h3>
        <BulletList items={[...strategy.review_flags.notes, ...strategy.review_flags.claims_to_validate]} />
      </article>

      <article className="panel">
        <p className="eyebrow">Evaluation</p>
        <ScoreBar label="Idea-to-vertical fit" value={evaluation.idea_to_vertical_fit} />
        <ScoreBar label="Account targeting" value={evaluation.account_targeting_quality} />
        <ScoreBar label="Relationship awareness" value={evaluation.relationship_awareness} />
        <ScoreBar label="Planet voice" value={evaluation.planet_voice_alignment} />
        <ScoreBar label="Channel strategy" value={evaluation.channel_strategy} />
        <ScoreBar label="Copy usefulness" value={evaluation.copy_usefulness} />
        <ScoreBar label="GTM impact" value={evaluation.gtm_impact} />
        <ScoreBar label="Safety and review" value={evaluation.safety_and_review_quality} />
        <p className="notes">{evaluation.final_recommendation}</p>
      </article>
    </section>
  );
}

export default function CampaignIdeaPage() {
  const [campaignIdea, setCampaignIdea] = useState("Disaster Season Readiness");
  const [optionalTargetAccount, setOptionalTargetAccount] = useState("FEMA");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("Existing target account");
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>("Net-new pipeline");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CampaignIdeaResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/campaign-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignIdea, optionalTargetAccount, relationshipType, campaignGoal })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate campaign strategy.");
      }

      setResult(payload.result);
    } catch {
      setError("Fallback strategy used. Human review required. Please try again with a more specific campaign idea.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero campaignIdeaHero">
        <div className="heroContent campaignIdeaHeroContent">
          <div className="heroCopy">
            <p className="eyebrow">Signal-to-campaign planner</p>
            <h1>Turn campaign ideas into GTM motions.</h1>
            <p>
              Start with a theme, product launch, event follow-up, or account motion. The agent maps
              it to Planet verticals, accounts, channels, copy, experiments, and KPIs before review.
            </p>
            <div className="modeLinks">
              <Link href="/">Account Brief</Link>
              <Link href="/campaign-idea" className="activeLink">Campaign Idea Mapper</Link>
            </div>
          </div>

          <form className="briefForm campaignIdeaForm" onSubmit={handleSubmit}>
            <label htmlFor="campaignIdea">Campaign idea</label>
            <textarea
              id="campaignIdea"
              value={campaignIdea}
              onChange={(event) => setCampaignIdea(event.target.value)}
              placeholder="Paste campaign idea, theme, or brief"
            />

            <label htmlFor="optionalTargetAccount">Optional target account</label>
            <input
              id="optionalTargetAccount"
              value={optionalTargetAccount}
              onChange={(event) => setOptionalTargetAccount(event.target.value)}
              placeholder="Company or agency name"
            />

            <label>Relationship type</label>
            <div className="segmentedControl">
              {RELATIONSHIP_TYPES.map((item) => (
                <button
                  type="button"
                  className={relationshipType === item ? "selected" : ""}
                  key={item}
                  onClick={() => setRelationshipType(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <label htmlFor="campaignGoal">Campaign goal</label>
            <select
              id="campaignGoal"
              value={campaignGoal}
              onChange={(event) => setCampaignGoal(event.target.value as CampaignGoal)}
            >
              {CAMPAIGN_GOALS.map((goal) => (
                <option key={goal}>{goal}</option>
              ))}
            </select>

            <button type="button" className="uploadPlaceholder">
              Upload campaign brief
            </button>
            <p className="helperText">
              Upload support planned for campaign briefs, event notes, sales notes, and product launch themes.
            </p>

            <div className="exampleBar" aria-label="Example campaign ideas">
              {quickIdeas.map((idea) => (
                <button type="button" key={idea} onClick={() => setCampaignIdea(idea)}>
                  {idea}
                </button>
              ))}
            </div>

            <button className="primarySubmit" type="submit" disabled={loading || campaignIdea.trim().length < 3}>
              {loading ? "Generating" : "Generate GTM strategy"}
            </button>
          </form>
        </div>
      </section>

      {error ? (
        <section className="errorPanel">
          <strong>Campaign strategy needs attention</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {loading ? (
        <section className="loadingPanel">
          <div className="pulse" />
          <div>
            <p className="eyebrow">Mapper running</p>
            <p>Mapping idea to verticals, accounts, relationship-aware motion, copy, KPIs, and review flags.</p>
          </div>
        </section>
      ) : null}

      {result ? <CampaignIdeaResults result={result} /> : null}
    </main>
  );
}
