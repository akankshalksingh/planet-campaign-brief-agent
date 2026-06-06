import Link from "next/link";
import { buildMockCampaignPackage } from "@/lib/campaign-builder/mockOutput";
import { buildCampaignInputFromSignal, getSignalById, getSignalIdea, leadSignals } from "@/lib/signals";

export default async function AttributionReviewPage({
  searchParams
}: {
  searchParams: Promise<{ signal?: string; idea?: string }>;
}) {
  const params = await searchParams;
  const signal = getSignalById(params.signal ?? "") ?? leadSignals[0];
  const selectedIdea = getSignalIdea(signal, params.idea);
  const input = buildCampaignInputFromSignal(signal, selectedIdea.id);
  const packageOutput = buildMockCampaignPackage(input, {
    verticalContext: [signal.likelyVertical],
    campaignPatterns: [selectedIdea.name],
    deterministicRules: ["Signal-selected campaign input", "Deterministic UTM rules", "Deterministic attribution readiness checks"]
  });

  const highRiskFlags = [
    ...packageOutput.reviewFlags.map((flag) => `${flag.severity}: ${flag.flag}`),
    ...signal.reviewFlags.map((flag) => `${flag.severity}: ${flag.title}`)
  ];

  return (
    <main>
      <section className="signalDetailHero">
        <div>
          <p className="eyebrow">Attribution Review</p>
          <h1>Measurement before launch.</h1>
          <p>
            This review uses mock demo data and deterministic checks. It does not create Salesforce campaigns,
            Marketo programs, or live campaign member records.
          </p>
          <div className="modeLinks workflowNav">
            <Link href="/signals">1. Signals</Link>
            <Link href={`/signals/${signal.id}`}>2. Account</Link>
            <Link href={`/signals/${signal.id}/ideas`}>3. Ideas</Link>
            <Link href={`/campaign-builder?signal=${signal.id}&idea=${selectedIdea.id}`}>4. Build</Link>
            <Link href={`/attribution-review?signal=${signal.id}&idea=${selectedIdea.id}`} className="activeLink">5. Review</Link>
          </div>
        </div>
        <div className="metrics">
          <div><span>Readiness</span><strong>{packageOutput.attributionReadiness.score}/100</strong></div>
          <div><span>Status</span><strong>{packageOutput.attributionReadiness.status.replace("_", " ")}</strong></div>
          <div><span>UTMs</span><strong>{packageOutput.utmLinks.length}</strong></div>
          <div className="warn"><span>Human review</span><strong>Required</strong></div>
        </div>
      </section>

      <section className="resultGrid">
        <article className="panel primaryPanel">
          <p className="eyebrow">Campaign under review</p>
          <h3>{packageOutput.campaignSummary.campaignName}</h3>
          <p>{packageOutput.campaignSummary.executiveSummary}</p>
          <dl className="detailList">
            <div><dt>Signal account</dt><dd>{signal.accountName}</dd></div>
            <div><dt>Source system</dt><dd>{signal.source}</dd></div>
            <div><dt>Selected idea</dt><dd>{selectedIdea.name}</dd></div>
          </dl>
        </article>

        <article className="panel warningPanel">
          <p className="eyebrow">Readiness blockers</p>
          <h3>{packageOutput.attributionReadiness.status.replace("_", " ")}</h3>
          <ul className="bulletList">
            {[...packageOutput.attributionReadiness.missingItems, ...packageOutput.attributionReadiness.warnings].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel builderWide">
          <p className="eyebrow">Attribution checks</p>
          <div className="checklistGrid">
            {packageOutput.attributionReadiness.checks.map((check) => (
              <div key={check.label} className={check.passed ? "done" : "needs_review"}>
                <span>{check.passed ? "Ready" : "Needs review"}</span>
                <strong>{check.label}</strong>
                <p>{check.note}</p>
                <em>{check.weight} pts</em>
              </div>
            ))}
          </div>
        </article>

        <article className="panel builderWide">
          <p className="eyebrow">UTM validation</p>
          <div className="utmTable">
            {packageOutput.utmLinks.map((link) => (
              <div key={link.url} className={link.validation.status}>
                <strong>{link.channel}</strong>
                <span>{link.utm_source} / {link.utm_medium}</span>
                <code>{link.url}</code>
                <p className="notes">{link.validation.issues.length ? link.validation.issues.join(" ") : "utm_source, utm_medium, utm_campaign, and utm_content are present."}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Salesforce / Marketo setup</p>
          <ul className="bulletList">
            <li>Salesforce Campaign ID missing.</li>
            <li>Marketo Program ID missing.</li>
            <li>Campaign Member Status mapping requires marketing ops review.</li>
            <li>Selected lifecycle stage: {input.lifecycleStage}.</li>
          </ul>
        </article>

        <article className="panel warningPanel">
          <p className="eyebrow">Human review flags</p>
          <ul className="bulletList">
            {highRiskFlags.map((flag) => <li key={flag}>{flag}</li>)}
          </ul>
        </article>
      </section>
    </main>
  );
}
