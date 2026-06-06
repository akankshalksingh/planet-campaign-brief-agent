"use client";

import Link from "next/link";
import { useState } from "react";
import { leadSignals } from "@/lib/signals";

const highConfidence = leadSignals.filter((signal) => signal.confidence === "High" || signal.confidence === "Very High");
const needsReview = leadSignals.filter((signal) => signal.status === "Needs Enrichment" || signal.status === "Manual Review");
const salesReady = leadSignals.filter((signal) => signal.status === "Sales Ready");
const nurtureOnly = leadSignals.filter((signal) => signal.status === "Nurture Only");

const sourceOptions = Array.from(new Set(leadSignals.map((signal) => signal.source))).sort();
const confidenceOptions = Array.from(new Set(leadSignals.map((signal) => signal.confidence)));
const statusOptions = Array.from(new Set(leadSignals.map((signal) => signal.status))).sort();
const verticalOptions = Array.from(new Set(leadSignals.map((signal) => signal.likelyVertical))).sort();

type SignalFilters = {
  source: string;
  confidence: string;
  status: string;
  vertical: string;
};

const defaultFilters: SignalFilters = {
  source: "All sources",
  confidence: "All confidence",
  status: "All statuses",
  vertical: "All likely fits"
};

function matchesFilters(signal: (typeof leadSignals)[number], filters: SignalFilters) {
  return (
    (filters.source === defaultFilters.source || signal.source === filters.source) &&
    (filters.confidence === defaultFilters.confidence || signal.confidence === filters.confidence) &&
    (filters.status === defaultFilters.status || signal.status === filters.status) &&
    (filters.vertical === defaultFilters.vertical || signal.likelyVertical === filters.vertical)
  );
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
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
  const [activeFilters, setActiveFilters] = useState<SignalFilters>(defaultFilters);
  const filteredSignals = leadSignals.filter((signal) => matchesFilters(signal, activeFilters));
  const hasActiveFilters = Object.entries(defaultFilters).some(
    ([key, value]) => activeFilters[key as keyof SignalFilters] !== value
  );

  function updateFilter(key: keyof SignalFilters, value: string) {
    setActiveFilters((current) => ({ ...current, [key]: value }));
  }

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

      <section className="filterBar structuredFilters" aria-label="Signal filters">
        <FilterSelect
          id="sourceFilter"
          label="Source system"
          value={activeFilters.source}
          options={[defaultFilters.source, ...sourceOptions]}
          onChange={(value) => updateFilter("source", value)}
        />
        <FilterSelect
          id="confidenceFilter"
          label="Confidence"
          value={activeFilters.confidence}
          options={[defaultFilters.confidence, ...confidenceOptions]}
          onChange={(value) => updateFilter("confidence", value)}
        />
        <FilterSelect
          id="statusFilter"
          label="Status"
          value={activeFilters.status}
          options={[defaultFilters.status, ...statusOptions]}
          onChange={(value) => updateFilter("status", value)}
        />
        <FilterSelect
          id="verticalFilter"
          label="Likely fit"
          value={activeFilters.vertical}
          options={[defaultFilters.vertical, ...verticalOptions]}
          onChange={(value) => updateFilter("vertical", value)}
        />
        <button type="button" className="resetFilters" onClick={() => setActiveFilters(defaultFilters)} disabled={!hasActiveFilters}>
          Reset filters
        </button>
      </section>

      <section className="filterResultCount">
        <p>
          {filteredSignals.length} signal{filteredSignals.length === 1 ? "" : "s"} shown
          {hasActiveFilters ? " for the selected filters." : "."}
        </p>
      </section>

      <section className="signalGrid">
        {filteredSignals.map((signal) => <SignalCard key={signal.id} signal={signal} />)}
      </section>
    </main>
  );
}
