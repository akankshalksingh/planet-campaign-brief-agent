"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { OrbitField } from "@/app/components/OrbitField";
import {
  CAMPAIGN_BUILDER_CHANNELS,
  CampaignBuilderChannel,
  CampaignBuilderOutput,
  LIFECYCLE_STAGES,
  SALES_MOTIONS
} from "@/lib/campaign-builder/schemas";
import { buildCampaignInputFromSignal, getSignalById } from "@/lib/signals";
import { VERTICALS } from "@/lib/types";

const demoInput = {
  campaignIdea: "Wildfire Risk Readiness",
  targetVertical: "Insurance & Risk",
  targetAudience: "Insurance risk teams, climate risk analysts, and government resilience teams",
  campaignGoal: "Generate qualified demo requests",
  primaryCTA: "Request a demo",
  landingPageUrl: "https://www.planet.com/solutions/climate-risk",
  region: "North America",
  channels: ["Email", "LinkedIn Paid", "SDR Follow-up", "Landing Page"] as CampaignBuilderChannel[],
  lifecycleStage: "Consideration",
  salesMotion: "ABM",
  campaignOwner: "Growth Marketing",
  notes:
    "Keep the message grounded in risk visibility, wildfire exposure, and earlier decision-making. Avoid unsupported claims."
};

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

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button type="button" className="copyButton" onClick={copy}>
      {copied ? "Copied" : label}
    </button>
  );
}

function ScoreBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div className="scoreRow">
      <div className="scoreLabel">
        <span>{label}</span>
        <strong>{value}/{max}</strong>
      </div>
      <div className="scoreTrack">
        <div className="scoreFill" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function CopyAssets({ result }: { result: CampaignBuilderOutput }) {
  const [tab, setTab] = useState<"Email" | "LinkedIn" | "SDR" | "Landing Page">("Email");
  const assets = result.copyAssets;

  const copyValue =
    tab === "Email"
      ? `${assets.email.subjectLines.join("\n")}\n\n${assets.email.previewText}\n\n${assets.email.body}`
      : tab === "LinkedIn"
        ? `${assets.linkedIn.headline}\n\n${assets.linkedIn.primaryText}\n\n${assets.linkedIn.description}`
        : tab === "SDR"
          ? `${assets.sdrFollowUp.opener}\n\n${assets.sdrFollowUp.talkTrack}\n\n${assets.sdrFollowUp.callToAction}`
          : `${assets.landingPage.headline}\n\n${assets.landingPage.subheadline}\n\n${assets.landingPage.proofPoints.join("\n")}\n\n${assets.landingPage.formCTA}`;

  return (
    <article className="panel copyPanel builderWide">
      <div className="panelHeader">
        <p className="eyebrow">Copy assets</p>
        <CopyButton value={copyValue} />
      </div>
      <div className="tabRow">
        {["Email", "LinkedIn", "SDR", "Landing Page"].map((item) => (
          <button key={item} type="button" className={tab === item ? "selected" : ""} onClick={() => setTab(item as typeof tab)}>
            {item}
          </button>
        ))}
      </div>

      {tab === "Email" ? (
        <div className="copyBlock">
          <span>Subject lines</span>
          <BulletList items={assets.email.subjectLines} />
          <span>Preview</span>
          <p>{assets.email.previewText}</p>
          <span>Body</span>
          <p>{assets.email.body}</p>
        </div>
      ) : null}

      {tab === "LinkedIn" ? (
        <div className="copyBlock">
          <span>Headline</span>
          <strong>{assets.linkedIn.headline}</strong>
          <span>Primary text</span>
          <p>{assets.linkedIn.primaryText}</p>
          <span>Description</span>
          <p>{assets.linkedIn.description}</p>
        </div>
      ) : null}

      {tab === "SDR" ? (
        <div className="copyBlock">
          <span>Opener</span>
          <p>{assets.sdrFollowUp.opener}</p>
          <span>Talk track</span>
          <p>{assets.sdrFollowUp.talkTrack}</p>
          <span>CTA</span>
          <p>{assets.sdrFollowUp.callToAction}</p>
        </div>
      ) : null}

      {tab === "Landing Page" ? (
        <div className="copyBlock">
          <span>Headline</span>
          <strong>{assets.landingPage.headline}</strong>
          <span>Subheadline</span>
          <p>{assets.landingPage.subheadline}</p>
          <span>Proof points</span>
          <BulletList items={assets.landingPage.proofPoints} />
          <span>Form CTA</span>
          <p>{assets.landingPage.formCTA}</p>
        </div>
      ) : null}
    </article>
  );
}

function CampaignBuilderResults({
  result,
  fallbackWarning
}: {
  result: CampaignBuilderOutput;
  fallbackWarning: string;
}) {
  return (
    <section className="resultGrid campaignBuilderResults">
      <div className="resultHero">
        <div>
          <p className="eyebrow">Campaign Builder V2</p>
          <h2>{result.campaignSummary.campaignName}</h2>
          <p>{result.campaignSummary.executiveSummary}</p>
        </div>
        <div className="metrics">
          <div>
            <span>Eval</span>
            <strong>{result.evalScore.totalScore}/40</strong>
          </div>
          <div>
            <span>Attribution</span>
            <strong>{result.attributionReadiness.score}/100</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{result.attributionReadiness.status.replace("_", " ")}</strong>
          </div>
          <div className="reviewFlag warn">
            <span>Review</span>
            <strong>{result.reviewFlags.length} flags</strong>
          </div>
        </div>
      </div>

      {fallbackWarning ? (
        <article className="panel warningPanel builderWide">
          <p className="eyebrow">Generation mode</p>
          <h3>Fallback package used</h3>
          <p>{fallbackWarning}</p>
        </article>
      ) : null}

      <article className="panel primaryPanel">
        <p className="eyebrow">Campaign summary</p>
        <h3>{result.campaignSummary.launchPositioning}</h3>
        <dl className="detailList">
          <div><dt>Vertical</dt><dd>{result.campaignSummary.targetVertical}</dd></div>
          <div><dt>Goal</dt><dd>{result.campaignSummary.campaignGoal}</dd></div>
          <div><dt>CTA</dt><dd>{result.campaignSummary.primaryCTA}</dd></div>
          <div><dt>Motion</dt><dd>{result.campaignSummary.salesMotion}</dd></div>
        </dl>
      </article>

      <article className="panel">
        <p className="eyebrow">Audience + buyer pain</p>
        <p>{result.audienceAndPain.targetAudience}</p>
        <div className="tagList">
          {result.audienceAndPain.buyerPersonas.map((item) => <span key={item}>{item}</span>)}
        </div>
        <BulletList items={result.audienceAndPain.buyerPains} />
      </article>

      <article className="panel builderWide">
        <p className="eyebrow">Channel plan</p>
        <div className="channelList builderChannels">
          {result.channelPlan.map((channel) => (
            <div key={channel.channel}>
              <strong>{channel.channel}</strong>
              <span>{channel.priority} · {channel.role}</span>
              <p>{channel.recommendedUse}</p>
              <p className="notes">{channel.opsNotes}</p>
            </div>
          ))}
        </div>
      </article>

      <CopyAssets result={result} />

      <article className="panel builderWide">
        <p className="eyebrow">UTM links</p>
        <div className="utmTable">
          {result.utmLinks.map((link) => (
            <div key={`${link.channel}-${link.utm_content}`} className={link.validation.status}>
              <strong>{link.channel}</strong>
              <span>{link.utm_campaign}</span>
              <code>{link.url}</code>
              <CopyButton value={link.url} label="Copy URL" />
              {link.validation.issues.length ? <p className="notes">{link.validation.issues.join(" ")}</p> : null}
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <p className="eyebrow">A/B test plan</p>
        <p>{result.abTestPlan.hypothesis}</p>
        <div className="variantGrid">
          <div><span>Variant A</span><strong>{result.abTestPlan.variantA}</strong></div>
          <div><span>Variant B</span><strong>{result.abTestPlan.variantB}</strong></div>
        </div>
        <p className="notes">Success: {result.abTestPlan.successMetric}</p>
        <p className="notes">Guardrail: {result.abTestPlan.guardrailMetric}</p>
      </article>

      <article className="panel">
        <p className="eyebrow">KPI plan</p>
        <h3>{result.kpiPlan.primaryKpi}</h3>
        <BulletList items={[...result.kpiPlan.secondaryKpis, ...result.kpiPlan.leadingIndicators]} />
        <p className="notes">{result.kpiPlan.reportingNotes}</p>
      </article>

      <article className="panel warningPanel">
        <p className="eyebrow">Attribution readiness</p>
        <h3>{result.attributionReadiness.score}/100 · {result.attributionReadiness.status.replace("_", " ")}</h3>
        <BulletList items={[...result.attributionReadiness.missingItems, ...result.attributionReadiness.warnings]} />
      </article>

      <article className="panel builderWide">
        <p className="eyebrow">Launch checklist</p>
        <div className="checklistGrid">
          {result.launchChecklist.map((item) => (
            <div key={`${item.category}-${item.item}`} className={item.status}>
              <span>{item.category}</span>
              <strong>{item.item}</strong>
              <p>{item.notes}</p>
              <em>{item.owner} · {item.status.replace("_", " ")}</em>
            </div>
          ))}
        </div>
      </article>

      <article className="panel warningPanel">
        <p className="eyebrow">Review flags</p>
        {result.reviewFlags.map((flag) => (
          <div className="reviewItem" key={flag.flag}>
            <span>{flag.severity}</span>
            <strong>{flag.flag}</strong>
            <p>{flag.recommendation}</p>
          </div>
        ))}
      </article>

      <article className="panel">
        <p className="eyebrow">Evaluation</p>
        <h3>{result.evalScore.status}</h3>
        <ScoreBar label="Vertical relevance" value={result.evalScore.accountVerticalRelevance} />
        <ScoreBar label="Planet fit" value={result.evalScore.planetFit} />
        <ScoreBar label="Specificity" value={result.evalScore.campaignSpecificity} />
        <ScoreBar label="Channel readiness" value={result.evalScore.channelReadiness} />
        <ScoreBar label="Attribution" value={result.evalScore.attributionReadiness} />
        <ScoreBar label="Groundedness" value={result.evalScore.groundedness} />
        <ScoreBar label="Actionability" value={result.evalScore.actionability} />
        <ScoreBar label="Review safety" value={result.evalScore.humanReviewSafety} />
      </article>
    </section>
  );
}

export default function CampaignBuilderPage() {
  const [form, setForm] = useState(() => {
    if (typeof window === "undefined") return demoInput;
    const params = new URLSearchParams(window.location.search);
    const signal = getSignalById(params.get("signal") ?? "");
    const initialForm = signal ? buildCampaignInputFromSignal(signal, params.get("idea") ?? undefined) : demoInput;
    const editedChannels = params.get("channels")
      ?.split(",")
      .map((channel) => channel.trim())
      .filter((channel): channel is CampaignBuilderChannel =>
        CAMPAIGN_BUILDER_CHANNELS.includes(channel as CampaignBuilderChannel)
      );

    return {
      ...initialForm,
      campaignIdea: params.get("campaignIdea") || initialForm.campaignIdea,
      primaryCTA: params.get("primaryCTA") || initialForm.primaryCTA,
      channels: editedChannels?.length ? editedChannels : initialForm.channels,
      notes: params.get("notes") || initialForm.notes
    };
  });
  const [result, setResult] = useState<CampaignBuilderOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fallbackWarning, setFallbackWarning] = useState("");

  function updateField(key: keyof typeof demoInput, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleChannel(channel: CampaignBuilderChannel) {
    setForm((current) => ({
      ...current,
      channels: current.channels.includes(channel)
        ? current.channels.filter((item) => item !== channel)
        : [...current.channels, channel]
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setFallbackWarning("");

    try {
      const response = await fetch("/api/campaign-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Unable to build campaign package.");
      }

      setResult(payload.data);
      setFallbackWarning(payload.warning ?? "");
    } catch {
      setError("Campaign Builder needs cleaner input before it can create a launch package.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="signalHero">
        <OrbitField />
        <div className="signalHeroContent">
          <p className="eyebrow">Campaign Execution</p>
          <h1>Campaign builder</h1>
          <p>
            Create the campaign assets, UTM links, channel plan, test plan, KPIs, and launch
            checklist.
          </p>
          <div className="modeLinks workflowNav">
            <Link href="/signals">1. Signals</Link>
            <Link href="/">2. Account</Link>
            <Link href="/campaign-idea">3. Ideas</Link>
            <Link href="/campaign-builder" className="activeLink">4. Build</Link>
            <Link href="/attribution-review">5. Review</Link>
          </div>
        </div>
      </section>

      <section className="workflowFormBand">
        <form className="briefForm campaignBuilderForm workflowForm" onSubmit={handleSubmit}>
          <div className="formHeader">
            <div>
              <p className="eyebrow">Launch input</p>
              <strong>Execution brief</strong>
            </div>
            <button type="button" className="copyButton" onClick={() => setForm(demoInput)}>Load demo</button>
          </div>

          <label htmlFor="campaignIdea">Campaign idea</label>
          <textarea id="campaignIdea" value={form.campaignIdea} onChange={(event) => updateField("campaignIdea", event.target.value)} />

          <div className="formTwoCol">
            <div>
              <label htmlFor="targetVertical">Target vertical</label>
              <select id="targetVertical" value={form.targetVertical} onChange={(event) => updateField("targetVertical", event.target.value)}>
                <option>Insurance & Risk</option>
                {VERTICALS.map((vertical) => <option key={vertical}>{vertical}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="campaignGoal">Campaign goal</label>
              <input id="campaignGoal" value={form.campaignGoal} onChange={(event) => updateField("campaignGoal", event.target.value)} />
            </div>
          </div>

          <label htmlFor="targetAudience">Target audience</label>
          <textarea id="targetAudience" value={form.targetAudience} onChange={(event) => updateField("targetAudience", event.target.value)} />

          <div className="formTwoCol">
            <div>
              <label htmlFor="primaryCTA">Primary CTA</label>
              <input id="primaryCTA" value={form.primaryCTA} onChange={(event) => updateField("primaryCTA", event.target.value)} />
            </div>
            <div>
              <label htmlFor="landingPageUrl">Landing page URL</label>
              <input id="landingPageUrl" value={form.landingPageUrl} onChange={(event) => updateField("landingPageUrl", event.target.value)} />
            </div>
          </div>

          <div className="formTwoCol">
            <div>
              <label htmlFor="lifecycleStage">Lifecycle stage</label>
              <select id="lifecycleStage" value={form.lifecycleStage} onChange={(event) => updateField("lifecycleStage", event.target.value)}>
                {LIFECYCLE_STAGES.map((stage) => <option key={stage}>{stage}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="salesMotion">Sales motion</label>
              <select id="salesMotion" value={form.salesMotion} onChange={(event) => updateField("salesMotion", event.target.value)}>
                {SALES_MOTIONS.map((motion) => <option key={motion}>{motion}</option>)}
              </select>
            </div>
          </div>

          <div className="formTwoCol">
            <div>
              <label htmlFor="region">Region</label>
              <input id="region" value={form.region} onChange={(event) => updateField("region", event.target.value)} />
            </div>
            <div>
              <label htmlFor="campaignOwner">Campaign owner</label>
              <input id="campaignOwner" value={form.campaignOwner} onChange={(event) => updateField("campaignOwner", event.target.value)} />
            </div>
          </div>

          <label>Channels</label>
          <div className="segmentedControl channelSelect">
            {CAMPAIGN_BUILDER_CHANNELS.map((channel) => (
              <button type="button" key={channel} className={form.channels.includes(channel) ? "selected" : ""} onClick={() => toggleChannel(channel)}>
                {channel}
              </button>
            ))}
          </div>

          <label htmlFor="notes">Notes</label>
          <textarea id="notes" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />

          <button className="primarySubmit" type="submit" disabled={loading || form.channels.length === 0}>
            {loading ? "Building" : "Build campaign package"}
          </button>
        </form>
      </section>

      {error ? (
        <section className="errorPanel">
          <strong>Campaign Builder needs attention</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {loading ? (
        <section className="loadingPanel">
          <div className="pulse" />
          <div>
            <p className="eyebrow">Builder running</p>
            <p>Generating channel assets, deterministic UTMs, attribution checks, checklist, and eval.</p>
          </div>
        </section>
      ) : null}

      {result ? <CampaignBuilderResults result={result} fallbackWarning={fallbackWarning} /> : null}
    </main>
  );
}
