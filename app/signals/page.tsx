"use client";

import Link from "next/link";
import { useState } from "react";
import { leadSignals } from "@/lib/signals";

const filters = [
  "All",
  "High confidence",
  "Needs review",
  "Sales-ready",
  "Event leads",
  "Product usage",
  "Website intent",
  "Webinar",
  "Paid media"
] as const;

type SignalFilter = (typeof filters)[number];

const highConfidence = leadSignals.filter((signal) => signal.confidence === "High" || signal.confidence === "Very High");
const needsReview = leadSignals.filter((signal) => signal.status === "Needs Enrichment" || signal.status === "Manual Review");
const salesReady = leadSignals.filter((signal) => signal.status === "Sales Ready");
const nurtureOnly = leadSignals.filter((signal) => signal.status === "Nurture Only");

function matchesFilter(signal: (typeof leadSignals)[number], filter: SignalFilter) {
  if (filter === "All") return true;
  if (filter === "High confidence") return signal.confidence === "High" || signal.confidence === "Very High";
  if (filter === "Needs review") return signal.status === "Needs Enrichment" || signal.status === "Manual Review";
  if (filter === "Sales-ready") return signal.status === "Sales Ready";
  if (filter === "Event leads") return signal.source.includes("Event") || signal.source.includes("SplashThat") || signal.source.includes("CSV");
  if (filter === "Product usage") return signal.source === "Product Freemium App";
  if (filter === "Website intent") return signal.source === "Marketo Web Activity" || signal.source === "Website Demo Form";
  if (filter === "Webinar") return signal.source === "Webinar Attendance" || signal.source === "Salesforce Campaign Member";
  if (filter === "Paid media") return signal.source === "LinkedIn Paid" || signal.source === "Google Ads" || signal.source === "Organic Social";
  return true;
}

function SignalCard({ signal }: { signal: (typeof leadSignals)[number] }) {
  return (
    <article className={`signalCard ${signal.status === "Manual Review" ? "manualReview" : ""}`}>
      <div className="signalCardHeader">
        <div>
          <p className="eyebrow">{signal.source}</p>
          <h3>{signal.accountName}</h3>
          <p>{signal.personName} · {signal.personTitle}</p>
        </div>
        <div className="intentBadge">
          <strong>{signal.intentScore}</strong>
          <span>intent</span>
        </div>
      </div>
      <p>{signal.sourceDetail}</p>
      <dl className="signalMeta">
        <div><dt>Confidence</dt><dd>{signal.confidence}</dd></div>
        <div><dt>Status</dt><dd>{signal.status}</dd></div>
        <div><dt>Likely fit</dt><dd>{signal.likelyVertical}</dd></div>
      </dl>
      <div className="campaignCallout">
        <span>Recommended action</span>
        <strong>{signal.recommendedAction}</strong>
      </div>
      <Link className="primaryLink" href={`/signals/${signal.id}`}>Review signal</Link>
    </article>
  );
}

export default function SignalInboxPage() {
  const [activeFilter, setActiveFilter] = useState<SignalFilter>("All");
  const filteredSignals = leadSignals.filter((signal) => matchesFilter(signal, activeFilter));

  return (
    <main>
      <section className="signalHero">
        <div>
          <p className="eyebrow">GTM Signal Inbox</p>
          <h1>Today&apos;s account signals</h1>
          <p>
            Demo-only signals structured like Marketo, Salesforce, event, product, paid-media, and enrichment data.
            The workflow starts with observed behavior before campaign ideas or copy are generated.
          </p>
          <div className="modeLinks workflowNav">
            <Link href="/signals" className="activeLink">1. Signals</Link>
            <Link href="/">2. Account</Link>
            <Link href="/campaign-idea">3. Ideas</Link>
            <Link href="/campaign-builder">4. Build</Link>
            <Link href="/attribution-review">5. Review</Link>
          </div>
        </div>
      </section>

      <section className="signalSummary">
        <div><span>{leadSignals.length}</span><strong>signals today</strong></div>
        <div><span>{highConfidence.length}</span><strong>high-confidence</strong></div>
        <div><span>{needsReview.length}</span><strong>need enrichment</strong></div>
        <div><span>{salesReady.length}</span><strong>sales-ready</strong></div>
        <div><span>{nurtureOnly.length}</span><strong>nurture-only</strong></div>
      </section>

      <section className="filterBar" aria-label="Signal filters">
        {filters.map((filter) => (
          <button
            type="button"
            key={filter}
            className={activeFilter === filter ? "selected" : ""}
            onClick={() => setActiveFilter(filter)}
            aria-pressed={activeFilter === filter}
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="filterResultCount">
        <p>{filteredSignals.length} signal{filteredSignals.length === 1 ? "" : "s"} shown for {activeFilter}.</p>
      </section>

      <section className="signalGrid">
        {filteredSignals.map((signal) => <SignalCard key={signal.id} signal={signal} />)}
      </section>
    </main>
  );
}
