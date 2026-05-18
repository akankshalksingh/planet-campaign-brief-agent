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

export function BriefView({ brief }: { brief: CampaignBrief }) {
  return (
    <section className="resultGrid" aria-live="polite">
      <div className="resultHero">
        <div>
          <p className="eyebrow">Campaign brief</p>
          <h2>{brief.company_name}</h2>
          <p>{brief.company_overview}</p>
        </div>
        <div className="metrics">
          <div>
            <span>Vertical</span>
            <strong>{brief.detected_vertical}</strong>
          </div>
          <div>
            <span>Fit</span>
            <strong>{brief.planet_fit_score}/10</strong>
          </div>
          <div>
            <span>Eval</span>
            <strong>{brief.eval_scores.total}/20</strong>
          </div>
          <div className={brief.metadata.human_review_required ? "reviewFlag warn" : "reviewFlag"}>
            <span>Review</span>
            <strong>{brief.metadata.human_review_required ? "Required" : "Ready"}</strong>
          </div>
        </div>
      </div>

      <article className="panel primaryPanel">
        <p className="eyebrow">Campaign angle</p>
        <h3>{brief.campaign_angle}</h3>
        <p>{brief.fit_rationale}</p>
      </article>

      <article className="panel">
        <p className="eyebrow">Planet use case</p>
        <p>{brief.planet_use_case}</p>
      </article>

      <article className="panel">
        <p className="eyebrow">Suggested next action</p>
        <p>{brief.suggested_next_action}</p>
      </article>

      <article className="panel">
        <p className="eyebrow">Risks and review flags</p>
        <p>{brief.risks_or_flags}</p>
      </article>

      <article className="panel">
        <p className="eyebrow">Evaluation</p>
        <ScoreBar label="Relevance" value={brief.eval_scores.relevance} max={5} />
        <ScoreBar label="Specificity" value={brief.eval_scores.specificity} max={5} />
        <ScoreBar label="Groundedness" value={brief.eval_scores.groundedness} max={5} />
        <ScoreBar label="Actionability" value={brief.eval_scores.actionability} max={5} />
        <p className="notes">{brief.eval_scores.eval_notes}</p>
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
