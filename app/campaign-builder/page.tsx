"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { OrbitField } from "@/app/components/OrbitField";
import {
  AssetHandoff,
  CAMPAIGN_BUILDER_CHANNELS,
  CampaignBuilderChannel,
  CampaignBuilderInput,
  CampaignBuilderOutput,
  LIFECYCLE_STAGES,
  SALES_MOTIONS
} from "@/lib/campaign-builder/schemas";
import { buildCampaignInputFromSignal, getSignalById, getSignalIdea } from "@/lib/signals";
import { VERTICALS } from "@/lib/types";

type BuilderForm = CampaignBuilderInput & { campaignName: string };
type ValidationErrors = Partial<Record<keyof BuilderForm | "channels", string>>;
type SourceContext = {
  title: string;
  meta: string;
  sourceLabel: string;
} | null;
type StoredBuilderSelection = {
  input?: CampaignBuilderInput;
  source?: Exclude<SourceContext, null>;
};
type AssetKey = "email" | "linkedin" | "sdr" | "landing_page";
type RegenKey = AssetKey | "summary";
type HandoffMessage = Partial<Record<AssetKey | "draft", string>>;

const currentYear = new Date().getFullYear();
const assetLabels: Record<AssetKey, string> = {
  email: "Email",
  linkedin: "LinkedIn Paid",
  sdr: "SDR Follow-up",
  landing_page: "Landing Page"
};

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

const emptyInput: BuilderForm = {
  campaignIdea: "",
  campaignName: "",
  targetVertical: "",
  targetAudience: "",
  campaignGoal: "",
  primaryCTA: "",
  landingPageUrl: "",
  region: "North America",
  channels: ["Email", "LinkedIn Paid", "SDR Follow-up", "Landing Page"],
  lifecycleStage: "Consideration",
  salesMotion: "ABM",
  campaignOwner: "Growth Marketing",
  notes: ""
};

const selectedBuilderInputKey = "planet:selectedCampaignBuilderInput";

function defaultLandingPageUrl(vertical: string) {
  if (vertical.includes("Agriculture")) return "https://www.planet.com/solutions/agriculture";
  if (vertical.includes("Maritime")) return "https://www.planet.com/solutions/maritime";
  if (vertical.includes("Defense")) return "https://www.planet.com/solutions/defense-and-intelligence";
  if (vertical.includes("Government")) return "https://www.planet.com/solutions/government";
  if (vertical.includes("Climate") || vertical.includes("Insurance")) return "https://www.planet.com/solutions/climate-risk";
  return "https://www.planet.com/solutions";
}

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
  const landingPageUrl = input.landingPageUrl?.trim() || defaultLandingPageUrl(input.targetVertical);
  return {
    ...input,
    landingPageUrl,
    campaignName: input.campaignName?.trim() || buildCampaignName(input.region || "North America", input.campaignIdea)
  };
}

function readStoredBuilderSelection(): StoredBuilderSelection | null {
  try {
    const stored = window.sessionStorage.getItem(selectedBuilderInputKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as StoredBuilderSelection;
    if (!parsed.input?.campaignIdea) return null;
    return parsed;
  } catch {
    return null;
  }
}

function parseInitialState(): { form: BuilderForm; source: SourceContext } {
  if (typeof window === "undefined") return { form: emptyInput, source: null };

  const params = new URLSearchParams(window.location.search);
  const signal = getSignalById(params.get("signal") ?? "");
  const idea = signal ? getSignalIdea(signal, params.get("idea") ?? undefined) : null;
  const storedSelection = readStoredBuilderSelection();
  const hasPrefill =
    signal ||
    params.has("campaignIdea") ||
    params.has("targetVertical") ||
    params.has("targetAudience") ||
    params.has("campaignGoal") ||
    params.has("primaryCTA");
  const initialForm = signal ? buildCampaignInputFromSignal(signal, idea?.id) : storedSelection?.input ?? emptyInput;
  const editedChannels = params.get("channels")
    ?.split(",")
    .map((channel) => channel.trim())
    .filter((channel): channel is CampaignBuilderChannel =>
      CAMPAIGN_BUILDER_CHANNELS.includes(channel as CampaignBuilderChannel)
    );

  const mergedInput = {
    ...initialForm,
    campaignIdea: params.get("campaignIdea") || initialForm.campaignIdea,
    targetVertical: params.get("targetVertical") || initialForm.targetVertical,
    targetAudience: params.get("targetAudience") || initialForm.targetAudience,
    campaignGoal: params.get("campaignGoal") || initialForm.campaignGoal,
    primaryCTA: params.get("primaryCTA") || initialForm.primaryCTA,
    channels: editedChannels?.length ? editedChannels : initialForm.channels,
    notes: params.get("notes") || initialForm.notes
  };
  const form = hasPrefill || storedSelection?.input ? toBuilderForm({
    ...mergedInput,
    landingPageUrl: params.get("landingPageUrl") || initialForm.landingPageUrl || defaultLandingPageUrl(mergedInput.targetVertical)
  }) : emptyInput;

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
      : storedSelection?.source
        ? storedSelection.source
        : null;

  return { form, source };
}

function cleanBody(body: string, fallback: string[]) {
  const lines = body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^hi\b/i.test(line));
  return lines.length ? lines : fallback;
}

function makeEmailBody(form: BuilderForm) {
  return [
    `${form.campaignIdea} decisions can move faster than traditional reporting cycles.`,
    `Planet helps ${form.targetAudience} use frequent Earth observation context to identify changing conditions, prioritize where deeper analysis may be needed, and align the team around a clearer next step.`,
    `See how this workflow can support earlier planning for ${form.targetVertical.toLowerCase()} teams.`
  ].join("\n\n");
}

function makeLinkedInText(form: BuilderForm) {
  return [
    `${form.campaignIdea} cannot wait for static reports to catch up.`,
    `Planet's frequent Earth observation data can help ${form.targetAudience} monitor changing ground conditions across large areas and identify where deeper analysis may be needed.`,
    "The goal is not more imagery. It is earlier evidence for better decisions.",
    `${form.primaryCTA} ->`
  ].join("\n\n");
}

function makeSdrMessage(form: BuilderForm) {
  return `Hi {{FirstName}},

Your team may be evaluating how changing conditions affect planning across large regions.

Planet helps ${form.targetAudience} use frequent Earth observation data to identify change and prioritize where deeper analysis is needed.

Would a short walkthrough of this ${form.campaignIdea.toLowerCase()} workflow be useful?`;
}

function polishResult(result: CampaignBuilderOutput, form: BuilderForm): CampaignBuilderOutput {
  const emailBody = makeEmailBody(form);
  return {
    ...result,
    campaignSummary: {
      ...result.campaignSummary,
      campaignName: form.campaignName || result.campaignSummary.campaignName,
      executiveSummary: `${form.campaignIdea} is ready for asset review and handoff across email, paid social, SDR follow-up, and landing-page activation.`
    },
    copyAssets: {
      ...result.copyAssets,
      email: {
        subjectLines: [`See ${form.campaignIdea.toLowerCase()} sooner`, `${form.campaignIdea}: earlier evidence for better decisions`],
        previewText: "Use frequent Earth observation to support earlier risk and operations decisions.",
        body: emailBody
      },
      linkedIn: {
        headline: `${form.campaignIdea} starts with earlier evidence`,
        primaryText: makeLinkedInText(form),
        description: form.primaryCTA
      },
      sdrFollowUp: {
        opener: `${form.campaignIdea} handoff`,
        talkTrack: makeSdrMessage(form),
        callToAction: "Ask whether a short workflow walkthrough would be useful."
      },
      landingPage: {
        headline: `See changing conditions sooner`,
        subheadline: `Use frequent Earth observation data to support earlier assessment, regional monitoring, and campaign follow-up for ${form.targetAudience}.`,
        proofPoints: [
          "Monitor changing conditions across large areas",
          "Add current visual evidence to planning workflows",
          "Prioritize where deeper investigation is needed"
        ],
        formCTA: form.primaryCTA
      }
    }
  };
}

function createDefaultHandoffs(owner: string): AssetHandoff[] {
  return [
    {
      assetType: "email",
      ownerRole: "Marketing Operations / Lifecycle Marketing",
      ownerName: owner,
      destination: "Marketing automation draft",
      nextAction: "Review and schedule email",
      status: "draft",
      notes: "Integration-ready handoff. No live marketing automation write is performed.",
      integrationMode: "integration_ready"
    },
    {
      assetType: "linkedin",
      ownerRole: "Paid Media / Growth Marketing",
      ownerName: "Paid Media",
      destination: "LinkedIn Campaign Manager draft",
      nextAction: "Review copy and creative",
      status: "draft",
      notes: "Demo workflow. No LinkedIn campaign is launched.",
      integrationMode: "demo"
    },
    {
      assetType: "sdr",
      ownerRole: "SDR owner / Sales",
      ownerName: "Sales",
      destination: "Salesforce task draft",
      nextAction: "Assign follow-up owner",
      status: "draft",
      notes: "Salesforce-ready task draft only. No live Salesforce task is created.",
      integrationMode: "integration_ready"
    },
    {
      assetType: "landing_page",
      ownerRole: "Web Marketing / Product Marketing",
      ownerName: "Web Marketing",
      destination: "CMS request or project-management ticket",
      nextAction: "Review and publish update",
      status: "draft",
      notes: "Web-team content request prepared. No CMS update is published.",
      integrationMode: "integration_ready"
    }
  ];
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

function FieldError({ message }: { message?: string }) {
  return message ? <p className="fieldError">{message}</p> : null;
}

function statusLabel(status: AssetHandoff["status"]) {
  return status.replaceAll("_", " ");
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

function AssetActionButton({
  asset,
  onAction
}: {
  asset: AssetKey;
  onAction: (asset: AssetKey) => void;
}) {
  const labels: Record<AssetKey, string> = {
    email: "Send for approval",
    linkedin: "Send to paid media",
    sdr: "Create Salesforce task draft",
    landing_page: "Notify web team"
  };
  return (
    <button type="button" className="copyButton" onClick={() => onAction(asset)}>
      {labels[asset]}
    </button>
  );
}

function EmailAsset({
  result,
  form,
  handoff,
  editing,
  loading,
  onEdit,
  onRegenerate,
  onHandoff,
  onEmailChange
}: {
  result: CampaignBuilderOutput;
  form: BuilderForm;
  handoff: AssetHandoff;
  editing: boolean;
  loading: boolean;
  onEdit: () => void;
  onRegenerate: () => void;
  onHandoff: () => void;
  onEmailChange: (field: "subject" | "previewText" | "body", value: string) => void;
}) {
  const email = result.copyAssets.email;
  const subject = email.subjectLines[0] || `See ${form.campaignIdea.toLowerCase()} sooner`;
  const body = cleanBody(email.body, makeEmailBody(form).split(/\n\n/));
  const copyValue = `Subject: ${subject}\nPreview text: ${email.previewText}\n\nHi {{FirstName}},\n\n${body.join("\n\n")}\n\n${form.primaryCTA}\n\nPlanet`;

  return (
    <div className="assetPreview">
      <div className="assetInfoGrid">
        <div><span>Asset</span><strong>Email</strong></div>
        <div><span>Audience</span><strong>{form.targetAudience}</strong></div>
        <div><span>Lifecycle</span><strong>{form.lifecycleStage}</strong></div>
        <div><span>Status</span><strong>{statusLabel(handoff.status)}</strong></div>
      </div>

      <div className="emailPreview">
        <div className="emailMeta">
          <div><span>From</span><strong>Planet Growth Marketing</strong></div>
          <div><span>To</span><strong>{form.targetAudience}</strong></div>
          <div>
            <span>Subject</span>
            {editing ? (
              <input value={subject} onChange={(event) => onEmailChange("subject", event.target.value)} />
            ) : (
              <strong>{subject}</strong>
            )}
          </div>
          <div>
            <span>Preview text</span>
            {editing ? (
              <input value={email.previewText} onChange={(event) => onEmailChange("previewText", event.target.value)} />
            ) : (
              <strong>{email.previewText}</strong>
            )}
          </div>
        </div>
        <div className="emailBody">
          <p>Hi {"{{FirstName}},"}</p>
          {editing ? (
            <textarea value={email.body} onChange={(event) => onEmailChange("body", event.target.value)} />
          ) : (
            body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          )}
          <button type="button">{form.primaryCTA}</button>
          <p>Planet</p>
        </div>
      </div>

      <div className="assetActions">
        <button type="button" className="copyButton" onClick={onEdit}>{editing ? "Done editing" : "Edit email"}</button>
        <CopyButton value={copyValue} label="Copy email" />
        <button type="button" className="copyButton" onClick={onRegenerate} disabled={loading}>{loading ? "Updating..." : "Regenerate email"}</button>
        <button type="button" className="copyButton" onClick={onHandoff}>Send for approval</button>
      </div>
    </div>
  );
}

function LinkedInAsset({
  result,
  form,
  handoff,
  editing,
  loading,
  onEdit,
  onRegenerate,
  onHandoff,
  onLinkedInChange
}: {
  result: CampaignBuilderOutput;
  form: BuilderForm;
  handoff: AssetHandoff;
  editing: boolean;
  loading: boolean;
  onEdit: () => void;
  onRegenerate: () => void;
  onHandoff: () => void;
  onLinkedInChange: (field: "primaryText" | "headline" | "description", value: string) => void;
}) {
  const linkedIn = result.copyAssets.linkedIn;
  const paragraphs = cleanBody(linkedIn.primaryText, makeLinkedInText(form).split(/\n\n/));
  const creative = "Before-and-after imagery or a regional change-detection visual showing how conditions evolved over time.";
  const copyValue = `${linkedIn.primaryText}\n\nHeadline: ${linkedIn.headline}\nCTA: ${linkedIn.description || form.primaryCTA}\nCreative: ${creative}`;

  return (
    <div className="assetPreview">
      <div className="assetInfoGrid">
        <div><span>Asset</span><strong>LinkedIn Paid</strong></div>
        <div><span>Status</span><strong>{statusLabel(handoff.status)}</strong></div>
        <div><span>Purpose</span><strong>Paid-social demand creation</strong></div>
        <div><span>CTA</span><strong>{linkedIn.description || form.primaryCTA}</strong></div>
      </div>
      <div className="socialPreview">
        <span>Primary text</span>
        {editing ? (
          <textarea value={linkedIn.primaryText} onChange={(event) => onLinkedInChange("primaryText", event.target.value)} />
        ) : (
          paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        )}
        <span>Headline</span>
        {editing ? (
          <input value={linkedIn.headline} onChange={(event) => onLinkedInChange("headline", event.target.value)} />
        ) : (
          <strong>{linkedIn.headline}</strong>
        )}
        <span>Suggested creative direction</span>
        <p>{creative}</p>
      </div>
      <div className="assetActions">
        <button type="button" className="copyButton" onClick={onEdit}>{editing ? "Done editing" : "Edit post"}</button>
        <CopyButton value={copyValue} label="Copy post" />
        <button type="button" className="copyButton" onClick={onRegenerate} disabled={loading}>{loading ? "Updating..." : "Regenerate post"}</button>
        <button type="button" className="copyButton" onClick={onHandoff}>Send to paid media</button>
      </div>
    </div>
  );
}

function SdrAsset({
  result,
  form,
  handoff,
  editing,
  loading,
  onEdit,
  onRegenerate,
  onHandoff,
  onSdrChange
}: {
  result: CampaignBuilderOutput;
  form: BuilderForm;
  handoff: AssetHandoff;
  editing: boolean;
  loading: boolean;
  onEdit: () => void;
  onRegenerate: () => void;
  onHandoff: () => void;
  onSdrChange: (field: "opener" | "talkTrack" | "callToAction", value: string) => void;
}) {
  const sdr = result.copyAssets.sdrFollowUp;
  const message = sdr.talkTrack || makeSdrMessage(form);
  const copyValue = `Subject: ${sdr.opener}\n\n${message}\n\nFollow-up action: ${sdr.callToAction}`;

  return (
    <div className="assetPreview">
      <div className="assetInfoGrid">
        <div><span>Target persona</span><strong>{result.audienceAndPain.buyerPersonas[0] || "Growth or operations lead"}</strong></div>
        <div><span>Context</span><strong>{form.targetAudience}</strong></div>
        <div><span>Status</span><strong>{statusLabel(handoff.status)}</strong></div>
        <div><span>Signal</span><strong>{form.campaignIdea}</strong></div>
      </div>
      <div className="handoffPreview">
        <span>Subject line</span>
        {editing ? (
          <input value={sdr.opener} onChange={(event) => onSdrChange("opener", event.target.value)} />
        ) : (
          <strong>{sdr.opener}</strong>
        )}
        <span>Message</span>
        {editing ? (
          <textarea value={message} onChange={(event) => onSdrChange("talkTrack", event.target.value)} />
        ) : (
          cleanBody(message, makeSdrMessage(form).split(/\n\n/)).map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        )}
        <span>Suggested follow-up action</span>
        {editing ? (
          <input value={sdr.callToAction} onChange={(event) => onSdrChange("callToAction", event.target.value)} />
        ) : (
          <p>{sdr.callToAction}</p>
        )}
      </div>
      <div className="assetActions">
        <button type="button" className="copyButton" onClick={onEdit}>{editing ? "Done editing" : "Edit message"}</button>
        <CopyButton value={copyValue} label="Copy message" />
        <button type="button" className="copyButton" onClick={onRegenerate} disabled={loading}>{loading ? "Updating..." : "Regenerate SDR message"}</button>
        <button type="button" className="copyButton" onClick={onHandoff}>Create Salesforce task draft</button>
      </div>
    </div>
  );
}

function LandingAsset({
  result,
  form,
  handoff,
  editing,
  loading,
  onEdit,
  onRegenerate,
  onHandoff,
  onLandingChange
}: {
  result: CampaignBuilderOutput;
  form: BuilderForm;
  handoff: AssetHandoff;
  editing: boolean;
  loading: boolean;
  onEdit: () => void;
  onRegenerate: () => void;
  onHandoff: () => void;
  onLandingChange: (field: "headline" | "subheadline" | "proofPoints" | "formCTA", value: string) => void;
}) {
  const landing = result.copyAssets.landingPage;
  const proofPoints = landing.proofPoints.length ? landing.proofPoints : [
    "Monitor changing conditions across large areas",
    "Add current visual evidence to planning workflows",
    "Prioritize where deeper investigation is needed"
  ];
  const copyValue = `${form.campaignIdea.toUpperCase()}\n${landing.headline}\n${landing.subheadline}\n${proofPoints.join("\n")}\n${landing.formCTA}`;

  return (
    <div className="assetPreview">
      <div className="landingPreview">
        <span>{form.campaignIdea.toUpperCase()}</span>
        {editing ? (
          <input value={landing.headline} onChange={(event) => onLandingChange("headline", event.target.value)} />
        ) : (
          <h3>{landing.headline}</h3>
        )}
        {editing ? (
          <textarea value={landing.subheadline} onChange={(event) => onLandingChange("subheadline", event.target.value)} />
        ) : (
          <p>{landing.subheadline}</p>
        )}
        {editing ? (
          <textarea value={proofPoints.join("\n")} onChange={(event) => onLandingChange("proofPoints", event.target.value)} />
        ) : (
          <ul>
            {proofPoints.slice(0, 3).map((point) => <li key={point}>{point}</li>)}
          </ul>
        )}
        <button type="button">{landing.formCTA}</button>
      </div>
      <div className="assetInfoGrid">
        <div><span>Suggested page owner</span><strong>{handoff.ownerRole}</strong></div>
        <div><span>Status</span><strong>{statusLabel(handoff.status)}</strong></div>
      </div>
      <div className="assetActions">
        <button type="button" className="copyButton" onClick={onEdit}>{editing ? "Done editing" : "Edit page copy"}</button>
        <CopyButton value={copyValue} label="Copy page copy" />
        <button type="button" className="copyButton" onClick={onRegenerate} disabled={loading}>{loading ? "Updating..." : "Regenerate page copy"}</button>
        <button type="button" className="copyButton" onClick={onHandoff}>Notify web team</button>
      </div>
    </div>
  );
}

function CampaignAssets({
  result,
  form,
  handoffs,
  activeAsset,
  editingAsset,
  loadingAsset,
  onAssetSelect,
  onEditAsset,
  onHandoff,
  onRegenerate,
  onUpdateResult
}: {
  result: CampaignBuilderOutput;
  form: BuilderForm;
  handoffs: AssetHandoff[];
  activeAsset: AssetKey;
  editingAsset: AssetKey | null;
  loadingAsset: RegenKey | null;
  onAssetSelect: (asset: AssetKey) => void;
  onEditAsset: (asset: AssetKey) => void;
  onHandoff: (asset: AssetKey) => void;
  onRegenerate: (asset: RegenKey) => void;
  onUpdateResult: (result: CampaignBuilderOutput) => void;
}) {
  const handoff = handoffs.find((item) => item.assetType === activeAsset) ?? createDefaultHandoffs(form.campaignOwner)[0];
  const assetTabs = Object.keys(assetLabels) as AssetKey[];

  return (
    <article className="panel builderWide campaignAssetsSection">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Campaign assets</p>
          <h3>Review, edit, and route each asset to the team responsible for activation.</h3>
        </div>
        <span className="demoBadge">Demo workflow</span>
      </div>
      <div className="tabRow">
        {assetTabs.map((asset) => (
          <button key={asset} type="button" className={activeAsset === asset ? "selected" : ""} onClick={() => onAssetSelect(asset)}>
            {assetLabels[asset]}
          </button>
        ))}
      </div>

      {activeAsset === "email" ? (
        <EmailAsset
          result={result}
          form={form}
          handoff={handoff}
          editing={editingAsset === "email"}
          loading={loadingAsset === "email"}
          onEdit={() => onEditAsset("email")}
          onRegenerate={() => onRegenerate("email")}
          onHandoff={() => onHandoff("email")}
          onEmailChange={(field, value) => {
            onUpdateResult({
              ...result,
              copyAssets: {
                ...result.copyAssets,
                email: {
                  ...result.copyAssets.email,
                  subjectLines: field === "subject" ? [value, ...result.copyAssets.email.subjectLines.slice(1)] : result.copyAssets.email.subjectLines,
                  previewText: field === "previewText" ? value : result.copyAssets.email.previewText,
                  body: field === "body" ? value : result.copyAssets.email.body
                }
              }
            });
          }}
        />
      ) : null}

      {activeAsset === "linkedin" ? (
        <LinkedInAsset
          result={result}
          form={form}
          handoff={handoff}
          editing={editingAsset === "linkedin"}
          loading={loadingAsset === "linkedin"}
          onEdit={() => onEditAsset("linkedin")}
          onRegenerate={() => onRegenerate("linkedin")}
          onHandoff={() => onHandoff("linkedin")}
          onLinkedInChange={(field, value) => {
            onUpdateResult({
              ...result,
              copyAssets: {
                ...result.copyAssets,
                linkedIn: {
                  ...result.copyAssets.linkedIn,
                  [field]: value
                }
              }
            });
          }}
        />
      ) : null}

      {activeAsset === "sdr" ? (
        <SdrAsset
          result={result}
          form={form}
          handoff={handoff}
          editing={editingAsset === "sdr"}
          loading={loadingAsset === "sdr"}
          onEdit={() => onEditAsset("sdr")}
          onRegenerate={() => onRegenerate("sdr")}
          onHandoff={() => onHandoff("sdr")}
          onSdrChange={(field, value) => {
            onUpdateResult({
              ...result,
              copyAssets: {
                ...result.copyAssets,
                sdrFollowUp: {
                  ...result.copyAssets.sdrFollowUp,
                  [field]: value
                }
              }
            });
          }}
        />
      ) : null}

      {activeAsset === "landing_page" ? (
        <LandingAsset
          result={result}
          form={form}
          handoff={handoff}
          editing={editingAsset === "landing_page"}
          loading={loadingAsset === "landing_page"}
          onEdit={() => onEditAsset("landing_page")}
          onRegenerate={() => onRegenerate("landing_page")}
          onHandoff={() => onHandoff("landing_page")}
          onLandingChange={(field, value) => {
            onUpdateResult({
              ...result,
              copyAssets: {
                ...result.copyAssets,
                landingPage: {
                  ...result.copyAssets.landingPage,
                  [field]: field === "proofPoints" ? value.split("\n").map((item) => item.trim()).filter(Boolean) : value
                }
              }
            });
          }}
        />
      ) : null}
    </article>
  );
}

function NextActions({
  handoffs,
  onHandoffUpdate,
  onHandoffAction
}: {
  handoffs: AssetHandoff[];
  onHandoffUpdate: (asset: AssetKey, field: keyof AssetHandoff, value: string) => void;
  onHandoffAction: (asset: AssetKey) => void;
}) {
  return (
    <article className="panel builderWide nextActionsPanel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Next actions</p>
          <h3>Route each generated asset to the person or system responsible for activation.</h3>
        </div>
        <span className="demoBadge">Integration-ready handoff</span>
      </div>
      <div className="handoffTable">
        {handoffs.map((handoff) => (
          <div key={handoff.assetType} className="handoffRow">
            <strong>{assetLabels[handoff.assetType]}</strong>
            <label>
              Owner
              <input value={handoff.ownerName || handoff.ownerRole} onChange={(event) => onHandoffUpdate(handoff.assetType, "ownerName", event.target.value)} />
            </label>
            <label>
              Destination
              <input value={handoff.destination} onChange={(event) => onHandoffUpdate(handoff.assetType, "destination", event.target.value)} />
            </label>
            <label>
              Due date
              <input type="date" value={handoff.dueDate || ""} onChange={(event) => onHandoffUpdate(handoff.assetType, "dueDate", event.target.value)} />
            </label>
            <label>
              Notes
              <input value={handoff.notes || ""} onChange={(event) => onHandoffUpdate(handoff.assetType, "notes", event.target.value)} />
            </label>
            <span>{statusLabel(handoff.status)}</span>
            <AssetActionButton asset={handoff.assetType} onAction={onHandoffAction} />
          </div>
        ))}
      </div>
    </article>
  );
}

function CampaignBuilderResults({
  result,
  form,
  handoffs,
  activeAsset,
  editingAsset,
  loadingAsset,
  handoffMessages,
  onUpdateAndRegenerate,
  onSaveDraft,
  onAssetSelect,
  onEditAsset,
  onRegenerate,
  onHandoffAction,
  onHandoffUpdate,
  onUpdateResult
}: {
  result: CampaignBuilderOutput;
  form: BuilderForm;
  handoffs: AssetHandoff[];
  activeAsset: AssetKey;
  editingAsset: AssetKey | null;
  loadingAsset: RegenKey | null;
  handoffMessages: HandoffMessage;
  onUpdateAndRegenerate: () => void;
  onSaveDraft: () => void;
  onAssetSelect: (asset: AssetKey) => void;
  onEditAsset: (asset: AssetKey) => void;
  onRegenerate: (asset: RegenKey) => void;
  onHandoffAction: (asset: AssetKey) => void;
  onHandoffUpdate: (asset: AssetKey, field: keyof AssetHandoff, value: string) => void;
  onUpdateResult: (result: CampaignBuilderOutput) => void;
}) {
  const generatedCount = handoffs.length;
  const sentForApproval = handoffs.filter((item) => item.status === "awaiting_approval").length;
  const salesPrepared = handoffs.filter((item) => item.assetType === "sdr" && item.status === "handoff_prepared").length;
  const webRequested = handoffs.filter((item) => item.assetType === "landing_page" && item.status === "activation_requested").length;

  return (
    <section className="resultGrid campaignBuilderResults handoffWorkspace">
      <article className="panel primaryPanel builderWide campaignPackageSummary">
        <div>
          <p className="eyebrow">Campaign package summary</p>
          <h2>{result.campaignSummary.campaignName}</h2>
          <p>{result.campaignSummary.targetVertical} · {form.salesMotion} · {form.lifecycleStage} · {form.region}</p>
        </div>
        <dl className="inlineFacts">
          <div><dt>Campaign goal</dt><dd>{form.campaignGoal}</dd></div>
          <div><dt>Audience</dt><dd>{form.targetAudience}</dd></div>
          <div><dt>Primary CTA</dt><dd>{form.primaryCTA}</dd></div>
          <div><dt>Assets generated</dt><dd>{generatedCount}</dd></div>
        </dl>
        <div className="assetActions">
          <button type="button" className="primarySubmit compactPrimary" onClick={onUpdateAndRegenerate}>Update and regenerate</button>
          <button type="button" className="copyButton" onClick={onSaveDraft}>Save draft</button>
        </div>
      </article>

      <CampaignAssets
        result={result}
        form={form}
        handoffs={handoffs}
        activeAsset={activeAsset}
        editingAsset={editingAsset}
        loadingAsset={loadingAsset}
        onAssetSelect={onAssetSelect}
        onEditAsset={onEditAsset}
        onHandoff={onHandoffAction}
        onRegenerate={onRegenerate}
        onUpdateResult={onUpdateResult}
      />

      <NextActions handoffs={handoffs} onHandoffUpdate={onHandoffUpdate} onHandoffAction={onHandoffAction} />

      <article className="panel builderWide campaignHandoffSummary">
        <p className="eyebrow">Campaign handoff</p>
        <ul className="compactBullets">
          <li>{generatedCount} assets generated</li>
          <li>{sentForApproval} assets sent for approval</li>
          <li>{salesPrepared} sales handoff prepared</li>
          <li>{webRequested} web update requested</li>
        </ul>
        {Object.values(handoffMessages).filter(Boolean).map((message) => (
          <p key={message} className="handoffNotice">{message}</p>
        ))}
        <div className="builderPrimaryActions">
          <Link className="primaryAction" href="/reporting">Continue to Reporting</Link>
          <button type="button" className="secondaryAction" onClick={onUpdateAndRegenerate}>Update and regenerate</button>
        </div>
      </article>
    </section>
  );
}

function regenerateAsset(result: CampaignBuilderOutput, form: BuilderForm, asset: RegenKey, count: number): CampaignBuilderOutput {
  const variant = count + 1;
  if (asset === "summary") {
    return polishResult({
      ...result,
      campaignSummary: {
        ...result.campaignSummary,
        campaignName: form.campaignName,
        executiveSummary: `${form.campaignIdea} is ready for owner review, asset handoff, and campaign activation.`
      }
    }, form);
  }
  if (asset === "email") {
    return {
      ...result,
      copyAssets: {
        ...result.copyAssets,
        email: {
          subjectLines: [
            `${form.campaignIdea}: earlier evidence for action`,
            `See ${form.targetVertical.toLowerCase()} change sooner`
          ],
          previewText: "Use current visual context to support faster planning decisions.",
          body: makeEmailBody(form)
        }
      }
    };
  }
  if (asset === "linkedin") {
    return {
      ...result,
      copyAssets: {
        ...result.copyAssets,
        linkedIn: {
          headline: `${form.campaignIdea} needs current evidence`,
          primaryText: makeLinkedInText(form),
          description: form.primaryCTA
        }
      }
    };
  }
  if (asset === "sdr") {
    return {
      ...result,
      copyAssets: {
        ...result.copyAssets,
        sdrFollowUp: {
          opener: `${form.campaignIdea} visibility`,
          talkTrack: makeSdrMessage(form),
          callToAction: variant % 2 ? "Ask whether a short workflow walkthrough would be useful." : "Offer a quick review of the campaign workflow."
        }
      }
    };
  }
  return {
    ...result,
    copyAssets: {
      ...result.copyAssets,
      landingPage: {
        headline: `See ${form.campaignIdea.toLowerCase()} sooner`,
        subheadline: `Use frequent Earth observation data to support earlier assessment, monitoring, and prioritization for ${form.targetAudience}.`,
        proofPoints: [
          "Monitor changing conditions across large areas",
          "Add current visual evidence to operational workflows",
          "Prioritize where deeper investigation is needed"
        ],
        formCTA: form.primaryCTA
      }
    }
  };
}

export default function CampaignBuilderPage() {
  const initialState = useMemo(() => parseInitialState(), []);
  const [form, setForm] = useState<BuilderForm>(initialState.form);
  const [sourceContext, setSourceContext] = useState<SourceContext>(initialState.source);
  const [campaignNameEdited, setCampaignNameEdited] = useState(Boolean(initialState.form.campaignName));
  const [result, setResult] = useState<CampaignBuilderOutput | null>(null);
  const [handoffs, setHandoffs] = useState<AssetHandoff[]>([]);
  const [activeAsset, setActiveAsset] = useState<AssetKey>("email");
  const [editingAsset, setEditingAsset] = useState<AssetKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAsset, setLoadingAsset] = useState<RegenKey | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [generatedNotice, setGeneratedNotice] = useState(false);
  const [handoffMessages, setHandoffMessages] = useState<HandoffMessage>({});
  const [regenCounts, setRegenCounts] = useState<Record<RegenKey, number>>({
    summary: 0,
    email: 0,
    linkedin: 0,
    sdr: 0,
    landing_page: 0
  });

  const channelSummary = `${form.channels.length} channel${form.channels.length === 1 ? "" : "s"} selected · ${form.channels.length} asset group${form.channels.length === 1 ? "" : "s"} will be generated`;
  const generationSummary = `This will generate campaign assets, owner handoffs, draft destinations, and a clear next action for each selected channel.`;
  const prefilledLabel = sourceContext?.sourceLabel;

  useEffect(() => {
    if (!form.campaignIdea.trim()) return;
    window.sessionStorage.setItem(
      selectedBuilderInputKey,
      JSON.stringify({
        input: form,
        source: sourceContext ?? {
          title: form.campaignIdea,
          meta: `${form.targetVertical || "Campaign"} · ${form.salesMotion} · ${form.lifecycleStage}`,
          sourceLabel: "Saved campaign setup"
        }
      })
    );
  }, [form, sourceContext]);

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

  async function generatePackage() {
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

      setResult(polishResult(payload.data, form));
      setHandoffs(createDefaultHandoffs(form.campaignOwner || "Growth Marketing"));
      setGeneratedNotice(true);
    } catch {
      setError("Campaign Builder needs cleaner input before it can create a campaign package.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await generatePackage();
  }

  function handleAssetRegenerate(asset: RegenKey) {
    if (!result || loadingAsset) return;
    setLoadingAsset(asset);
    window.setTimeout(() => {
      setResult((current) => current ? regenerateAsset(current, form, asset, regenCounts[asset]) : current);
      if (asset !== "summary") {
        setHandoffs((current) => current.map((item) => item.assetType === asset ? { ...item, status: "draft" } : item));
      }
      setRegenCounts((current) => ({ ...current, [asset]: current[asset] + 1 }));
      setLoadingAsset(null);
    }, 450);
  }

  function handleHandoffAction(asset: AssetKey) {
    const updates: Record<AssetKey, { status: AssetHandoff["status"]; message: string }> = {
      email: { status: "awaiting_approval", message: "Email draft routed to Marketing Operations." },
      linkedin: { status: "activation_requested", message: "LinkedIn asset prepared for Paid Media." },
      sdr: { status: "handoff_prepared", message: "Salesforce-ready SDR task draft created." },
      landing_page: { status: "activation_requested", message: "Landing-page content request prepared for the Web team." }
    };
    setHandoffs((current) => current.map((item) => item.assetType === asset ? { ...item, status: updates[asset].status } : item));
    setHandoffMessages((current) => ({ ...current, [asset]: updates[asset].message }));
  }

  function handleHandoffUpdate(asset: AssetKey, field: keyof AssetHandoff, value: string) {
    setHandoffs((current) => current.map((item) => item.assetType === asset ? { ...item, [field]: value } : item));
  }

  function handleSaveDraft() {
    setHandoffMessages((current) => ({ ...current, draft: "Campaign package draft saved locally for this demo workflow." }));
  }

  return (
    <main>
      <section className="signalHero">
        <OrbitField />
        <div className="signalHeroContent">
          <p className="eyebrow">Campaign Builder</p>
          <h1>Campaign builder</h1>
          <p>Generate campaign assets, assign the next owner, and prepare each channel for activation.</p>
          <div className="modeLinks workflowNav">
            <Link href="/signals">1. Signals</Link>
            <Link href="/">2. Account</Link>
            <Link href="/campaign-idea">3. Ideas</Link>
            <Link href="/campaign-builder" className="activeLink">4. Build</Link>
            <Link href="/reporting">5. Reporting</Link>
          </div>
        </div>
      </section>

      <section className="workflowFormBand">
        <form className="briefForm campaignBuilderForm workflowForm guidedBuilderForm" onSubmit={handleSubmit}>
          <div className="formHeader">
            <div>
              <p className="eyebrow">Launch input</p>
              <strong>Campaign setup</strong>
              <p>Confirm the selected idea, audience, channels, and messaging context before creating assets.</p>
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
              <p className="eyebrow">Selected idea</p>
              <h2>Campaign idea summary</h2>
              <p>Review the idea and campaign direction carried forward from the previous step.</p>
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
                <FieldLabel required>Primary CTA</FieldLabel>
                <input id="primaryCTA" value={form.primaryCTA} onChange={(event) => updateField("primaryCTA", event.target.value)} />
                <FieldError message={fieldErrors.primaryCTA} />
              </div>
            </div>
          </section>

          <section className="builderSetupSection">
            <div className="setupSectionIntro">
              <p className="eyebrow">Audience and goal</p>
              <h2>Who this is for</h2>
              <p>Keep the audience and conversion goal tight so the generated assets stay focused.</p>
            </div>

            <div>
              <FieldLabel required prefilled={prefilledLabel}>Target audience</FieldLabel>
              <textarea id="targetAudience" className="compactTextarea" value={form.targetAudience} onChange={(event) => updateField("targetAudience", event.target.value)} />
              <FieldError message={fieldErrors.targetAudience} />
            </div>

            <div>
              <FieldLabel required>Campaign goal</FieldLabel>
              <input id="campaignGoal" value={form.campaignGoal} onChange={(event) => updateField("campaignGoal", event.target.value)} />
              <FieldError message={fieldErrors.campaignGoal} />
            </div>
          </section>

          <section className="builderSetupSection">
            <div className="setupSectionIntro">
              <p className="eyebrow">Channels</p>
              <h2>Choose assets to build</h2>
              <p>Select the channels that should receive generated campaign assets.</p>
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
          </section>

          <section className="builderSetupSection">
            <div className="setupSectionIntro">
              <p className="eyebrow">Optional notes</p>
              <h2>Messaging context</h2>
              <p>Add proof points, claims to avoid, audience context, or brand guidance.</p>
            </div>
            <div>
              <FieldLabel optional>Messaging context</FieldLabel>
              <textarea id="notes" className="guidanceTextarea" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Add required proof points, claims to avoid, audience context, or brand guidance." />
            </div>

            <details className="advancedSettings">
              <summary>Advanced settings</summary>
              <div className="formTwoCol">
                <div>
                  <FieldLabel required>Landing-page URL</FieldLabel>
                  <input id="landingPageUrl" value={form.landingPageUrl} onChange={(event) => updateField("landingPageUrl", event.target.value)} />
                  <FieldError message={fieldErrors.landingPageUrl} />
                </div>
                <div>
                  <FieldLabel optional>Campaign name</FieldLabel>
                  <input value={form.campaignName} onChange={(event) => {
                    setCampaignNameEdited(true);
                    updateField("campaignName", event.target.value);
                  }} />
                  <p className="builderSummaryLine">Generated from region, campaign idea, and year.</p>
                </div>
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
              <button type="button" className="copyButton advancedRecalculate" onClick={recalculateName}>Recalculate campaign name</button>
            </details>
          </section>

          <div className="generationSummary">
            <p>{generationSummary}</p>
          </div>

          <div className="builderPrimaryActions">
            <button className="primarySubmit" type="submit" disabled={loading}>
              {loading ? "Building campaign assets..." : result ? "Update and regenerate" : "Build campaign assets"}
            </button>
            {result ? <Link className="secondaryAction" href="/reporting">Continue to Reporting</Link> : null}
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
          handoffs={handoffs}
          activeAsset={activeAsset}
          editingAsset={editingAsset}
          loadingAsset={loadingAsset}
          handoffMessages={handoffMessages}
          onUpdateAndRegenerate={generatePackage}
          onSaveDraft={handleSaveDraft}
          onAssetSelect={setActiveAsset}
          onEditAsset={(asset) => setEditingAsset((current) => current === asset ? null : asset)}
          onRegenerate={handleAssetRegenerate}
          onHandoffAction={handleHandoffAction}
          onHandoffUpdate={handleHandoffUpdate}
          onUpdateResult={setResult}
        />
      ) : null}
    </main>
  );
}
