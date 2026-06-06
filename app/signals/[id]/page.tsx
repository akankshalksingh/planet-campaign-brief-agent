import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignalById } from "@/lib/signals";

export default async function SignalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const signal = getSignalById(id);
  if (!signal) notFound();

  const timelineTotal = signal.behaviorTimeline.reduce((total, item) => total + item.weight, 0);

  return (
    <main>
      <section className="signalDetailHero">
        <div>
          <p className="eyebrow">Account Signal Detail</p>
          <h1>{signal.accountName}</h1>
          <p>{signal.sourceDetail}</p>
          <div className="modeLinks workflowNav">
            <Link href="/signals">1. Signals</Link>
            <Link href="/" className="activeLink">2. Account</Link>
            <Link href={`/signals/${signal.id}/ideas`}>3. Ideas</Link>
            <Link href={`/campaign-builder?signal=${signal.id}`}>4. Build</Link>
            <Link href={`/attribution-review?signal=${signal.id}`}>5. Review</Link>
          </div>
        </div>
        <div className="metrics">
          <div><span>Intent</span><strong>{signal.intentScore}/100</strong></div>
          <div><span>Confidence</span><strong>{signal.confidence}</strong></div>
          <div><span>Status</span><strong>{signal.status}</strong></div>
          <div className={signal.reviewFlags.some((flag) => flag.severity === "High") ? "warn" : ""}><span>Review flags</span><strong>{signal.reviewFlags.length}</strong></div>
        </div>
      </section>

      <section className="resultGrid">
        <article className="panel primaryPanel">
          <p className="eyebrow">Account summary</p>
          <h3>{signal.personName} · {signal.personTitle}</h3>
          <dl className="detailList">
            <div><dt>Domain</dt><dd>{signal.accountDomain}</dd></div>
            <div><dt>Region</dt><dd>{signal.region}</dd></div>
            <div><dt>Industry</dt><dd>{signal.industry}</dd></div>
            <div><dt>Company size</dt><dd>{signal.companySize}</dd></div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">Intent reasoning</p>
          <p>
            The observed behavior totals {timelineTotal} weighted points and maps to an intent score of {signal.intentScore}/100.
            The recommended next step is based on score, confidence, source quality, and review flags.
          </p>
          <div className="campaignCallout">
            <span>Recommended next action</span>
            <strong>{signal.recommendedAction}</strong>
          </div>
        </article>

        <article className="panel builderWide">
          <p className="eyebrow">Observed behavior timeline</p>
          <div className="timelineList">
            {signal.behaviorTimeline.map((event) => (
              <div key={`${event.date}-${event.eventType}`}>
                <span>{event.date} · {event.eventType}</span>
                <strong>{event.description}</strong>
                <em>{event.weight > 0 ? "+" : ""}{event.weight} signal weight</em>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Fit classification</p>
          <h3>{signal.likelyVertical}</h3>
          <p>{signal.likelyUseCase}</p>
          <p className="notes">{signal.routingSuggestion}</p>
        </article>

        <article className="panel warningPanel">
          <p className="eyebrow">Review risks</p>
          {signal.reviewFlags.map((flag) => (
            <div className="reviewItem" key={flag.title}>
              <span>{flag.severity}</span>
              <strong>{flag.title}</strong>
              <p>{flag.detail}</p>
            </div>
          ))}
        </article>
      </section>

      <section className="signalActionBand">
        <div>
          <p className="eyebrow">Next workflow step</p>
          <h2>Generate campaign ideas from this signal.</h2>
          <p>Campaign ideas stay grounded in the account behavior and keep adjacent or low-confidence signals under human review.</p>
        </div>
        <Link className="primaryLink" href={`/signals/${signal.id}/ideas`}>Generate campaign ideas</Link>
      </section>
    </main>
  );
}
