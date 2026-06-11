"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CampaignBuilderInput } from "@/lib/campaign-builder/schemas";
import { buildCampaignInputFromSignal, CampaignIdeaSeed, LeadSignal, toBuilderChannels } from "@/lib/signals";

type EditableIdea = CampaignIdeaSeed;

function buildRegeneratedIdeas(signal: LeadSignal, round: number): EditableIdea[] {
  const baseScore = Math.max(62, Math.min(94, signal.intentScore - 4 + round));
  const vertical = signal.likelyVertical;
  const useCaseLead = signal.likelyUseCase.split(",")[0] ?? signal.likelyUseCase;
  const isAdjacent = vertical.includes("Adjacent") || signal.status === "Manual Review";
  const isSalesReady = signal.status === "Sales Ready";

  return [
    {
      id: `regen_${round}_1`,
      name: isAdjacent ? `${signal.accountName} Review Path` : `${useCaseLead} Activation`,
      theme: isAdjacent
        ? `Frame ${signal.accountName} as a reviewed adjacent opportunity before any outbound motion.`
        : `Use the recent signal to turn ${useCaseLead.toLowerCase()} interest into a focused campaign motion.`,
      useCase: signal.likelyUseCase,
      bestChannels: isSalesReady ? ["SDR Follow-up", "Email", "Landing Page"] : ["Email", "LinkedIn Paid", "SDR Follow-up"],
      cta: isSalesReady ? "Request a workflow demo" : "Explore the workflow",
      fitScore: baseScore,
      reviewNote: isAdjacent
        ? "Manual review required before outreach; do not overstate core ICP fit."
        : "Generated from observed signal behavior; validate account ownership before launch."
    },
    {
      id: `regen_${round}_2`,
      name: `${signal.source.replace(" Activity", "")} Follow-up`,
      theme: `Build a follow-up motion around the source behavior that made this account stand out.`,
      useCase: `Observed behavior from ${signal.source}: ${signal.observedBehavior[0] ?? signal.likelyUseCase}`,
      bestChannels: signal.source.includes("Webinar") || signal.source.includes("Event")
        ? ["Event Follow-up", "Email", "SDR Follow-up"]
        : ["LinkedIn Paid", "Email", "Landing Page"],
      cta: "See the relevant Planet workflow",
      fitScore: Math.max(60, baseScore - 3),
      reviewNote: "Useful when the campaign manager wants source-specific follow-up instead of a broad vertical campaign."
    },
    {
      id: `regen_${round}_3`,
      name: `${vertical.replace(" & ", " and ")} Education Motion`,
      theme: `Use Planet-style education to explain where frequent Earth observation data supports ${vertical.toLowerCase()} workflows.`,
      useCase: `Education-led campaign for ${signal.personTitle} and related stakeholders at ${signal.accountName}.`,
      bestChannels: ["Email", "Webinar", "Organic Social"],
      cta: "Explore technical resources",
      fitScore: Math.max(58, baseScore - 6),
      reviewNote: "Best when the signal is promising but not ready for direct sales language."
    }
  ];
}

function buildCampaignBuilderHref(signal: LeadSignal, campaignIdea: EditableIdea) {
  const builderInput = buildCampaignInputFromSignal(signal, campaignIdea.id);
  const targetAudience = `${signal.personTitle} and adjacent stakeholders at ${signal.accountName}; ${campaignIdea.useCase}`;
  const notes = `Signal source: ${signal.source}. ${signal.sourceDetail}. Review note: ${campaignIdea.reviewNote}. This is mock demo data, not a live Salesforce or Marketo record.`;
  const params = new URLSearchParams({
    signal: signal.id,
    idea: campaignIdea.id,
    campaignIdea: campaignIdea.name,
    targetVertical: builderInput.targetVertical,
    targetAudience,
    campaignGoal: builderInput.campaignGoal,
    primaryCTA: campaignIdea.cta,
    landingPageUrl: builderInput.landingPageUrl,
    channels: toBuilderChannels(campaignIdea.bestChannels).join(","),
    notes
  });

  return `/campaign-builder?${params.toString()}`;
}

function buildStoredSelection(signal: LeadSignal, campaignIdea: EditableIdea): CampaignBuilderInput {
  const builderInput = buildCampaignInputFromSignal(signal, campaignIdea.id);
  return {
    ...builderInput,
    campaignIdea: campaignIdea.name,
    targetAudience: `${signal.personTitle} and adjacent stakeholders at ${signal.accountName}; ${campaignIdea.useCase}`,
    primaryCTA: campaignIdea.cta,
    channels: toBuilderChannels(campaignIdea.bestChannels),
    notes: `Signal source: ${signal.source}. ${signal.sourceDetail}. Review note: ${campaignIdea.reviewNote}. This is mock demo data, not a live Salesforce or Marketo record.`
  };
}

function persistSelectedIdea(signal: LeadSignal, campaignIdea: EditableIdea) {
  window.sessionStorage.setItem(
    "planet:selectedCampaignBuilderInput",
    JSON.stringify({
      input: buildStoredSelection(signal, campaignIdea),
      source: {
        title: campaignIdea.name,
        meta: `${signal.accountName} · ${signal.likelyVertical} · ${signal.status}`,
        sourceLabel: "Pre-filled from selected idea"
      }
    })
  );
}

export function SignalIdeaWorkspace({ signal }: { signal: LeadSignal }) {
  const [ideas, setIdeas] = useState<EditableIdea[]>(signal.suggestedCampaignIdeas);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [regenerationRound, setRegenerationRound] = useState(0);
  const sourceLabel = useMemo(() => `${signal.source} · ${signal.intentScore}/100 intent`, [signal]);

  function regenerateIdeas() {
    const nextRound = regenerationRound + 1;
    setRegenerationRound(nextRound);
    setEditingId(null);
    setIdeas(buildRegeneratedIdeas(signal, nextRound));
  }

  function updateIdea(id: string, key: keyof EditableIdea, value: string) {
    setIdeas((current) =>
      current.map((campaignIdea) => {
        if (campaignIdea.id !== id) return campaignIdea;
        if (key === "fitScore") {
          return { ...campaignIdea, fitScore: Math.max(1, Math.min(100, Number(value) || 1)) };
        }
        if (key === "bestChannels") {
          return {
            ...campaignIdea,
            bestChannels: value.split(",").map((item) => item.trim()).filter(Boolean)
          };
        }
        return { ...campaignIdea, [key]: value };
      })
    );
  }

  return (
    <section className="resultGrid">
      <article className="panel builderWide">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Account context reminder</p>
            <div className="tagList">
              <span>{sourceLabel}</span>
              <span>{signal.likelyVertical}</span>
              <span>{signal.region}</span>
              <span>{signal.status}</span>
            </div>
          </div>
          <button type="button" className="copyButton" onClick={regenerateIdeas}>
            Regenerate ideas
          </button>
        </div>
        <p>{signal.sourceDetail}</p>
      </article>

      {ideas.map((campaignIdea) => {
        const isEditing = editingId === campaignIdea.id;

        return (
          <article className="panel primaryPanel ideaCard" key={campaignIdea.id}>
            <div className="panelHeader">
              <p className="eyebrow">Campaign idea</p>
              <button
                type="button"
                className="copyButton"
                onClick={() => setEditingId(isEditing ? null : campaignIdea.id)}
              >
                {isEditing ? "Done editing" : "Edit idea"}
              </button>
            </div>

            {isEditing ? (
              <div className="ideaEditForm">
                <label>
                  <span>Name</span>
                  <input value={campaignIdea.name} onChange={(event) => updateIdea(campaignIdea.id, "name", event.target.value)} />
                </label>
                <label>
                  <span>Theme</span>
                  <textarea value={campaignIdea.theme} onChange={(event) => updateIdea(campaignIdea.id, "theme", event.target.value)} />
                </label>
                <label>
                  <span>Use case</span>
                  <textarea value={campaignIdea.useCase} onChange={(event) => updateIdea(campaignIdea.id, "useCase", event.target.value)} />
                </label>
                <label>
                  <span>Channels, comma separated</span>
                  <input value={campaignIdea.bestChannels.join(", ")} onChange={(event) => updateIdea(campaignIdea.id, "bestChannels", event.target.value)} />
                </label>
                <label>
                  <span>CTA</span>
                  <input value={campaignIdea.cta} onChange={(event) => updateIdea(campaignIdea.id, "cta", event.target.value)} />
                </label>
                <label>
                  <span>Review note</span>
                  <textarea value={campaignIdea.reviewNote} onChange={(event) => updateIdea(campaignIdea.id, "reviewNote", event.target.value)} />
                </label>
              </div>
            ) : (
              <>
                <h3>{campaignIdea.name}</h3>
                <p>{campaignIdea.theme}</p>
                <dl className="detailList">
                  <div><dt>Use case</dt><dd>{campaignIdea.useCase}</dd></div>
                  <div><dt>Recommended CTA</dt><dd>{campaignIdea.cta}</dd></div>
                  <div><dt>Fit score</dt><dd>{campaignIdea.fitScore}/100</dd></div>
                </dl>
                <div className="tagList">
                  {campaignIdea.bestChannels.map((channel) => <span key={channel}>{channel}</span>)}
                </div>
                <p className="notes">{campaignIdea.reviewNote}</p>
              </>
            )}

            <Link className="primaryLink" href={buildCampaignBuilderHref(signal, campaignIdea)} onClick={() => persistSelectedIdea(signal, campaignIdea)}>
              Build this campaign
            </Link>
          </article>
        );
      })}
    </section>
  );
}
