"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { OrbitField } from "@/app/components/OrbitField";
import { calculateAttributionReadiness } from "@/lib/campaign-builder/attributionReadiness";
import { buildLaunchChecklist } from "@/lib/campaign-builder/launchChecklist";
import {
  CAMPAIGN_BUILDER_CHANNELS,
  CampaignBuilderChannel,
  CampaignBuilderInput,
  CampaignBuilderOutput,
  LIFECYCLE_STAGES,
  SALES_MOTIONS
} from "@/lib/campaign-builder/schemas";
import { generateUtmLinks } from "@/lib/campaign-builder/utm";
import { buildCampaignInputFromSignal, getSignalById, getSignalIdea } from "@/lib/signals";
import { VERTICALS } from "@/lib/types";

type BuilderForm = CampaignBuilderInput & { campaignName: string };
type ValidationErrors = Partial<Record<keyof BuilderForm | "channels", string>>;
type SourceContext = {
  title: string;
  meta: string;
  sourceLabel: string;
} | null;
type RegenKey =
  | "summary"
  | "email"
  | "ads"
  | "sdr"
  | "landing"
  | "test"
  | "utms"
  | "attribution"
  | "checklist";

const currentYear = new Date().getFullYear();

const demoInput: BuilderForm = {
  campaignIdea: "Wildfire Risk Readiness",
  campaignName: "NA_Wildfire_Risk_Readiness_2026",
  targetVertical: "Insurance & Risk",
  targetAudience: "Insurance risk teams, climate risk analysts, and government resilience teams",
  campaignGoal: "Generate qualified demo requests",
  primaryCTA: "Request a demo",
  landingPageUrl: "https://www.planet.com/solutions/climate-risk",
  region: "North America",
  channels: ["Email", "LinkedIn Paid", "SDR Follow-up", "Landing Page"],
  lifecycleStage: "Consideration",
  salesMotion: "ABM",
  campaignOwner: "Growth Marketing",
  notes:
    "Keep the message grounded in risk visibility, wildfire exposure, and earlier decision-making. Avoid unsupported claims."
};

function regionCode(region: string) {
  const normalized = region.trim().toLowerCase();
  if (!normalized) return "GLOBAL";
  if (normalized.includes("north america")) return "NA";
  if (normalized.includes("europe")) return "EU";
  if (normalized.includes("asia")) return "APAC";
  if (normalized.includes("latin")) return "LATAM";
  return region
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "") || "GLOBAL";
}

function normalizeNamePart(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function buildCampaignName(region: string, campaignIdea: string, year = currentYear) {
  const idea = normalizeNamePart(campaignIdea) || "Campaign";
  return `${regionCode(region)}_${idea}_${year}`;
}

function toBuilderForm(input: CampaignBuilderInput): BuilderForm {
  return {
    ...input,
    campaignName: input.campaignName?.trim() || buildCampaignName(input.region || "North America", input.campaignIdea)
  };
}

function parseInitialState(): { form: BuilderForm; source: SourceContext } {
  if (typeof window === "undefined") return { form: demoInput, source: null };

  const params = new URLSearchParams(window.location.search);
  const signal = getSignalById(params.get("signal") ?? "");
  const idea = signal ? getSignalIdea(signal, params.get("idea") ?? undefined) : null;
  const initialForm = signal ? buildCampaignInputFromSignal(signal, idea?.id) : demoInput;
  const editedChannels = params.get("channels")
    ?.split(",")
    .map((channel) => channel.trim())
    .filter((channel): channel is CampaignBuilderChannel =>
      CAMPAIGN_BUILDER_CHANNELS.includes(channel as CampaignBuilderChannel)
    );

  const form = toBuilderForm({
    ...initialForm,
    campaignIdea: params.get("campaignIdea") || initialForm.campaignIdea,
    targetVertical: params.get("targetVertical") || initialForm.targetVertical,
    targetAudience: params.get("targetAudience") || initialForm.targetAudience,
    campaignGoal: params.get("campaignGoal") || initialForm.campaignGoal,
    primaryCTA: params.get("primaryCTA") || initialForm.primaryCTA,
    channels: editedChannels?.length ? editedChannels : initialForm.channels,
    notes: params.get("notes") || initialForm.notes
  });

  const source = signal
    ? {
        title: idea?.name || signal.suggestedCampaignIdeas[0]?.name || signal.recommendedAction,
        meta: `${signal.accountName} · ${signal.likelyVertical} · ${form.salesMotion} · ${form.lifecycleStage}`,
        sourceLabel: "Pre-filled from Signals"
      }
    : params.has("campaignIdea")
      ? {
          title: form.campaignIdea,
          meta: `${form.targetVertical} · ${form.salesMotion} · ${form.lifecycleStage}`,
          sourceLabel: params.has("targetAudience") ? "Pre-filled from Account" : "Pre-filled from Ideas"
        }
      : null;

  return { form, source };
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return null;
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

function FieldLabel({
  children,
  required,
  optional,
  prefilled
}: {
  children: string;
  required?: boolean;
  optional?: boolean;
  prefilled?: string;
}) {
  return (
    <label>
      <span>
        {children}
        {required ? <em>Required</em> : null}
        {optional ? <em>Optional</em> : null}
        {prefilled ? <em>{prefilled}</em> : null}
      </span>
    </label>
  );
}

function applyDeterministicChecks(output: CampaignBuilderOutput, form: BuilderForm): CampaignBuilderOutput {
  const input = form as CampaignBuilderInput;
  const campaignName = form.campaignName || output.campaignSummary.campaignName;
  const utmLinks = generateUtmLinks(input, campaignName);
  const launchChecklist = buildLaunchChecklist(input);
  const withDeterministic = {
    ...output,
    campaignSummary: {
      ...output.campaignSummary,
      campaignName
    },
    utmLinks,
    launchChecklist
  };

  return {
    ...withDeterministic,
    attributionReadiness: calculateAttributionReadiness(input, withDeterministic)
  };
}

function regenerateSection(
  result: CampaignBuilderOutput,
  form: BuilderForm,
  section: RegenKey,
  count: number
): CampaignBuilderOutput {
  const campaignName = form.campaignName || result.campaignSummary.campaignName;
  const variant = count + 1;

  if (section === "summary") {
    return {
      ...result,
      campaignSummary: {
        ...result.campaignSummary,
        campaignName,
        executiveSummary: `${campaignName} turns ${form.campaignIdea.toLowerCase()} into a launch-ready motion for ${form.targetAudience}.`,
        launchPositioning: `Lead with ${form.targetVertical} teams needing clearer evidence, faster prioritization, and a measurable next action.`
      }
    };
  }

  if (section === "email") {
    return {
      ...result,
      copyAssets: {
        ...result.copyAssets,
        email: {
          subjectLines: [
            `${form.campaignIdea}: see the signal sooner`,
            `A clearer next step for ${form.targetVertical}`,
            `Turn changing conditions into action`
          ],
          previewText: `A practical Planet workflow for ${form.targetAudience}.`,
          body: `Hi there,\n\n${form.campaignIdea} is built for teams that need timely, objective context before decisions become urgent. Planet can help ${form.targetAudience} monitor change, prioritize action, and move from static reporting to clearer evidence.\n\n${form.primaryCTA} to see how this could support your next campaign or account motion.`
        }
      }
    };
  }

  if (section === "ads") {
    return {
      ...result,
      copyAssets: {
        ...result.copyAssets,
        linkedIn: {
          headline: `${form.campaignIdea} starts with better evidence`,
          primaryText: `Your team does not need another static view. Use Planet context to spot meaningful change and focus the next ${form.salesMotion} motion.`,
          description: form.primaryCTA
        }
      }
    };
  }

  if (section === "sdr") {
    return {
      ...result,
      copyAssets: {
        ...result.copyAssets,
        sdrFollowUp: {
          opener: `I noticed ${form.campaignIdea.toLowerCase()} may be relevant for teams like yours.`,
          talkTrack: `The campaign angle is simple: use timely visual evidence to prioritize where ${form.targetVertical} teams should focus next.`,
          callToAction: form.primaryCTA
        }
      }
    };
  }

  if (section === "landing") {
    return {
      ...result,
      copyAssets: {
        ...result.copyAssets,
        landingPage: {
          headline: `${form.campaignIdea}: move from delayed signals to earlier decisions`,
          subheadline: `Give ${form.targetAudience} a clearer way to monitor change, prioritize action, and connect engagement to measurable campaign outcomes.`,
          proofPoints: [
            "Timely Earth observation context",
            "Campaign-ready vertical messaging",
            "Review-ready assets with attribution discipline"
          ],
          formCTA: form.primaryCTA
        }
      }
    };
  }

  if (section === "test") {
    return {
      ...result,
      abTestPlan: {
        hypothesis: `A ${form.campaignIdea.toLowerCase()} message focused on urgency will outperform a broad education message.`,
        variantA: `Lead with the decision risk ${variant % 2 ? "of delayed evidence" : "of missed change signals"}.`,
        variantB: `Lead with the business outcome: ${form.campaignGoal.toLowerCase()}.`,
        successMetric: form.campaignGoal,
        guardrailMetric: "Lead quality and sales acceptance rate"
      }
    };
  }

  if (section === "checklist") {
    return applyDeterministicChecks({ ...result, launchChecklist: buildLaunchChecklist(form) }, form);
  }

  if (section === "utms" || section === "attribution") {
    return applyDeterministicChecks(result, form);
  }

  return result;
}

function validateForm(form: BuilderForm): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!form.campaignIdea.trim()) errors.campaignIdea = "Enter a campaign idea.";
  if (!form.targetVertical.trim()) errors.targetVertical = "Select a target vertical.";
  if (!form.campaignGoal.trim()) errors.campaignGoal = "Enter a campaign goal.";
  if (!form.targetAudience.trim()) errors.targetAudience = "Enter the audience this campaign should reach.";
  if (!form.primaryCTA.trim()) errors.primaryCTA = "Enter the primary CTA.";
  if (!form.landingPageUrl.trim()) {
    errors.landingPageUrl = "Enter a landing-page URL.";
  } else {
    try {
      new URL(form.landingPageUrl);
    } catch {
      errors.landingPageUrl = "Enter a valid landing-page URL.";
    }
  }
  if (!form.channels.length) errors.channels = "Select at least one channel.";

  return errors;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="fieldError">{message}</p> : null;
}

function CopyAssets({
  result,
  onRegenerate,
  loadingSection
}: {
  result: CampaignBuilderOutput;
  onRegenerate: (section: RegenKey) => void;
  loadingSection: RegenKey | null;
}) {
  const [tab, setTab] = useState<"Email" | "LinkedIn" | "SDR" | "Landing Page">("Email");
  const assets = result.copyAssets;
  const action =
    tab === "Email"
      ? { key: "email" as const, label: "Regenerate email" }
      : tab === "LinkedIn"
        ? { key: "ads" as const, label: "Regenerate ads" }
        : tab === "SDR"
          ? { key: "sdr" as const, label: "Regenerate SDR copy" }
          : { key: "landing" as const, label: "Regenerate landing-page copy" };
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
        <div className="actionRow">
          <button type="button" className="copyButton" onClick={() => onRegenerate(action.key)} disabled={loadingSection === action.key}>
            {loadingSection === action.key ? "Updating..." : action.label}
          </button>
          <CopyButton value={copyValue} />
        </div>
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
  form,
  loadingSection,
  onRegenerate
}: {
  result: CampaignBuilderOutput;
  form: BuilderForm;
  loadingSection: RegenKey | null;
  onRegenerate: (section: RegenKey) => void;
}) {
  return (
    <section className="resultGrid campaignBuilderResults">
      <div className="resultHero">
        <div>
          <div className="panelHeader">
            <p className="eyebrow">Campaign Builder</p>
            <button type="button" className="copyButton" onClick={() => onRegenerate("summary")} disabled={loadingSection === "summary"}>
              {loadingSection === "summary" ? "Updating..." : "Regenerate campaign direction"}
            </button>
          </div>
          <h2>{result.campaignSummary.campaignName}</h2>
          <p>{result.campaignSummary.executiveSummary}</p>
        </div>
        <div className="metrics">
          <div><span>Eval</span><strong>{result.evalScore.totalScore}/40</strong></div>
          <div><span>Attribution</span><strong>{result.attributionReadiness.score}/100</strong></div>
          <div><span>Status</span><strong>{result.attributionReadiness.status.replace("_", " ")}</strong></div>
          <div className="reviewFlag warn"><span>Review</span><strong>{result.reviewFlags.length} flags</strong></div>
        </div>
      </div>

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

      <CopyAssets result={result} onRegenerate={onRegenerate} loadingSection={loadingSection} />

      <article className="panel builderWide">
        <div className="panelHeader">
          <p className="eyebrow">UTM links</p>
          <button type="button" className="copyButton" onClick={() => onRegenerate("utms")} disabled={loadingSection === "utms"}>
            {loadingSection === "utms" ? "Recalculating..." : "Recalculate UTMs"}
          </button>
        </div>
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
        <div className="panelHeader">
          <p className="eyebrow">A/B test plan</p>
          <button type="button" className="copyButton" onClick={() => onRegenerate("test")} disabled={loadingSection === "test"}>
            {loadingSection === "test" ? "Updating..." : "Generate new test"}
          </button>
        </div>
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
        <div className="panelHeader">
          <p className="eyebrow">Attribution readiness</p>
          <button type="button" className="copyButton" onClick={() => onRegenerate("attribution")} disabled={loadingSection === "attribution"}>
            {loadingSection === "attribution" ? "Checking..." : "Re-run attribution checks"}
          </button>
        </div>
        <h3>{result.attributionReadiness.score}/100 · {result.attributionReadiness.status.replace("_", " ")}</h3>
        <BulletList items={[...result.attributionReadiness.missingItems, ...result.attributionReadiness.warnings]} />
      </article>

      <article className="panel builderWide">
        <div className="panelHeader">
          <p className="eyebrow">Launch checklist</p>
          <button type="button" className="copyButton" onClick={() => onRegenerate("checklist")} disabled={loadingSection === "checklist"}>
            {loadingSection === "checklist" ? "Checking..." : "Re-run launch checks"}
          </button>
        </div>
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

      <div className="builderPostActions builderWide">
        <Link className="primaryAction" href="/attribution-review">
          Continue to review
        </Link>
        <span>{form.channels.length} channels selected · {form.channels.length} asset groups generated</span>
      </div>
    </section>
  );
}

export default function CampaignBuilderPage() {
  const initialState = useMemo(() => parseInitialState(), []);
  const [form, setForm] = useState<BuilderForm>(initialState.form);
  const [sourceContext, setSourceContext] = useState<SourceContext>(initialState.source);
  const [campaignNameEdited, setCampaignNameEdited] = useState(Boolean(initialState.form.campaignName));
  const [result, setResult] = useState<CampaignBuilderOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [generatedNotice, setGeneratedNotice] = useState(false);
  const [sectionLoading, setSectionLoading] = useState<RegenKey | null>(null);
  const [regenCounts, setRegenCounts] = useState<Record<RegenKey, number>>({
    summary: 0,
    email: 0,
    ads: 0,
    sdr: 0,
    landing: 0,
    test: 0,
    utms: 0,
    attribution: 0,
    checklist: 0
  });

  const channelSummary = `${form.channels.length} channel${form.channels.length === 1 ? "" : "s"} selected · ${form.channels.length} asset group${form.channels.length === 1 ? "" : "s"} will be generated`;
  const generationSummary = `This will generate ${form.channels.length} channel plan${form.channels.length === 1 ? "" : "s"}, ${form.channels.length} asset group${form.channels.length === 1 ? "" : "s"}, UTM links, one test plan, KPI recommendations, attribution checks, and a launch checklist.`;
  const prefilledLabel = sourceContext?.sourceLabel;

  function updateField(key: keyof BuilderForm, value: string) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if ((key === "campaignIdea" || key === "region") && !campaignNameEdited) {
        next.campaignName = buildCampaignName(next.region || "North America", next.campaignIdea);
      }
      return next;
    });
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function toggleChannel(channel: CampaignBuilderChannel) {
    setForm((current) => ({
      ...current,
      channels: current.channels.includes(channel)
        ? current.channels.filter((item) => item !== channel)
        : [...current.channels, channel]
    }));
    setFieldErrors((current) => ({ ...current, channels: undefined }));
  }

  function loadDemo() {
    setForm(demoInput);
    setSourceContext(null);
    setCampaignNameEdited(true);
    setFieldErrors({});
    setError("");
  }

  function recalculateName() {
    setForm((current) => ({
      ...current,
      campaignName: buildCampaignName(current.region || "North America", current.campaignIdea)
    }));
    setCampaignNameEdited(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateForm(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length) {
      setError("Please fix the highlighted campaign setup fields before generating.");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedNotice(false);

    try {
      const response = await fetch("/api/campaign-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error("Unable to generate campaign package.");
      }

      setResult(payload.data);
      setGeneratedNotice(true);
    } catch {
      setError("Campaign Builder needs cleaner input before it can create a launch package.");
    } finally {
      setLoading(false);
    }
  }

  function handleSectionRegenerate(section: RegenKey) {
    if (!result || sectionLoading) return;
    setSectionLoading(section);
    window.setTimeout(() => {
      setResult((current) => {
        if (!current) return current;
        return regenerateSection(current, form, section, regenCounts[section]);
      });
      setRegenCounts((current) => ({ ...current, [section]: current[section] + 1 }));
      setSectionLoading(null);
    }, 450);
  }

  return (
    <main>
      <section className="signalHero">
        <OrbitField />
        <div className="signalHeroContent">
          <p className="eyebrow">Campaign Builder</p>
          <h1>Campaign builder</h1>
          <p>Create the campaign assets, UTM links, channel plan, test plan, KPIs, and launch checklist.</p>
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
        <form className="briefForm campaignBuilderForm workflowForm guidedBuilderForm" onSubmit={handleSubmit}>
          <div className="formHeader">
            <div>
              <p className="eyebrow">Launch input</p>
              <strong>Campaign setup</strong>
              <p>Confirm the campaign direction and choose the assets, channels, and launch requirements to generate.</p>
            </div>
            <button type="button" className="copyButton" onClick={loadDemo}>Load demo</button>
          </div>

          {sourceContext ? (
            <div className="builtFromCard">
              <div>
                <span>Built from</span>
                <strong>{sourceContext.title}</strong>
                <p>{sourceContext.meta}</p>
              </div>
              <button type="button" className="copyButton" onClick={() => document.getElementById("campaignIdea")?.focus()}>
                Edit source
              </button>
            </div>
          ) : null}

          <section className="builderSetupSection">
            <div className="setupSectionIntro">
              <p className="eyebrow">01 — Campaign direction</p>
              <h2>Define the core motion</h2>
              <p>Define what the campaign is about, who it is for, and what action it should drive.</p>
            </div>

            <div>
              <FieldLabel required prefilled={prefilledLabel}>Campaign idea</FieldLabel>
              <input id="campaignIdea" value={form.campaignIdea} onChange={(event) => updateField("campaignIdea", event.target.value)} />
              <FieldError message={fieldErrors.campaignIdea} />
            </div>

            <div className="formTwoCol">
              <div>
                <FieldLabel required prefilled={prefilledLabel}>Target vertical</FieldLabel>
                <select id="targetVertical" value={form.targetVertical} onChange={(event) => updateField("targetVertical", event.target.value)}>
                  <option>Insurance & Risk</option>
                  {VERTICALS.map((vertical) => <option key={vertical}>{vertical}</option>)}
                </select>
                <FieldError message={fieldErrors.targetVertical} />
              </div>
              <div>
                <FieldLabel required>Campaign goal</FieldLabel>
                <input id="campaignGoal" value={form.campaignGoal} onChange={(event) => updateField("campaignGoal", event.target.value)} />
                <FieldError message={fieldErrors.campaignGoal} />
              </div>
            </div>

            <div>
              <FieldLabel required prefilled={prefilledLabel}>Target audience</FieldLabel>
              <textarea
                id="targetAudience"
                className="compactTextarea"
                value={form.targetAudience}
                onChange={(event) => updateField("targetAudience", event.target.value)}
              />
              <FieldError message={fieldErrors.targetAudience} />
            </div>

            <div>
              <FieldLabel required>Primary CTA</FieldLabel>
              <input id="primaryCTA" value={form.primaryCTA} onChange={(event) => updateField("primaryCTA", event.target.value)} />
              <FieldError message={fieldErrors.primaryCTA} />
            </div>
          </section>

          <section className="builderSetupSection">
            <div className="setupSectionIntro">
              <p className="eyebrow">02 — Activation details</p>
              <h2>Choose channels and launch structure</h2>
              <p>Choose where the campaign will run and how it should be structured.</p>
            </div>

            <div>
              <FieldLabel required>Landing-page URL</FieldLabel>
              <input id="landingPageUrl" value={form.landingPageUrl} onChange={(event) => updateField("landingPageUrl", event.target.value)} />
              <FieldError message={fieldErrors.landingPageUrl} />
            </div>

            <div>
              <FieldLabel required>Channels</FieldLabel>
              <div className="channelChipGrid">
                {CAMPAIGN_BUILDER_CHANNELS.map((channel) => (
                  <button type="button" key={channel} className={form.channels.includes(channel) ? "selected" : ""} onClick={() => toggleChannel(channel)}>
                    {channel}
                  </button>
                ))}
              </div>
              <p className="builderSummaryLine">{channelSummary}</p>
              <FieldError message={fieldErrors.channels} />
            </div>

            <details className="advancedSettings">
              <summary>Advanced campaign settings</summary>
              <div className="formTwoCol">
                <div>
                  <FieldLabel optional>Lifecycle stage</FieldLabel>
                  <select id="lifecycleStage" value={form.lifecycleStage} onChange={(event) => updateField("lifecycleStage", event.target.value)}>
                    {LIFECYCLE_STAGES.map((stage) => <option key={stage}>{stage}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel optional>Sales motion</FieldLabel>
                  <select id="salesMotion" value={form.salesMotion} onChange={(event) => updateField("salesMotion", event.target.value)}>
                    {SALES_MOTIONS.map((motion) => <option key={motion}>{motion}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel optional>Region</FieldLabel>
                  <input id="region" value={form.region} onChange={(event) => updateField("region", event.target.value)} />
                </div>
                <div>
                  <FieldLabel optional>Campaign owner</FieldLabel>
                  <input id="campaignOwner" value={form.campaignOwner} onChange={(event) => updateField("campaignOwner", event.target.value)} />
                </div>
              </div>
            </details>
          </section>

          <section className="builderSetupSection">
            <div className="setupSectionIntro">
              <p className="eyebrow">03 — Messaging guidance</p>
              <h2>Add guardrails</h2>
              <p>Add required proof points, claims to avoid, audience context, or brand instructions.</p>
            </div>

            <div>
              <FieldLabel optional>Messaging guidance</FieldLabel>
              <textarea
                id="notes"
                className="guidanceTextarea"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Add required proof points, claims to avoid, audience context, or brand guidance."
              />
            </div>
          </section>

          <div className="campaignNamePreview">
            <div>
              <span>Campaign name</span>
              <input
                value={form.campaignName}
                onChange={(event) => {
                  setCampaignNameEdited(true);
                  updateField("campaignName", event.target.value);
                }}
              />
              <p>Generated from region, campaign idea, and year. Uses underscores for Salesforce, Marketo, and UTMs.</p>
            </div>
            <button type="button" className="copyButton" onClick={recalculateName}>
              Recalculate name
            </button>
          </div>

          <div className="generationSummary">
            <p>{generationSummary}</p>
          </div>

          <div className="builderPrimaryActions">
            <button className="primarySubmit" type="submit" disabled={loading}>
              {loading ? "Generating campaign package..." : result ? "Update and regenerate" : "Generate campaign package"}
            </button>
            {result ? (
              <Link className="secondaryAction" href="/attribution-review">
                Continue to review
              </Link>
            ) : null}
          </div>
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
            <p>Generating campaign package...</p>
          </div>
        </section>
      ) : null}

      {generatedNotice && result ? (
        <section className="successPanel">
          <strong>Campaign package generated</strong>
          <p>Created from the current campaign setup.</p>
        </section>
      ) : null}

      {result ? (
        <CampaignBuilderResults
          result={result}
          form={form}
          loadingSection={sectionLoading}
          onRegenerate={handleSectionRegenerate}
        />
      ) : null}
    </main>
  );
}
