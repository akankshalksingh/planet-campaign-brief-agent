import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignalById } from "@/lib/signals";

export default async function SignalIdeasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const signal = getSignalById(id);
  if (!signal) notFound();

  return (
    <main>
      <section className="signalDetailHero">
        <div>
          <p className="eyebrow">Campaign ideas from signal</p>
          <h1>{signal.accountName}</h1>
          <p>{signal.likelyUseCase}</p>
          <div className="modeLinks workflowNav">
            <Link href="/signals">1. Signals</Link>
            <Link href={`/signals/${signal.id}`}>2. Account</Link>
            <Link href={`/signals/${signal.id}/ideas`} className="activeLink">3. Ideas</Link>
            <Link href={`/campaign-builder?signal=${signal.id}`}>4. Build</Link>
            <Link href={`/attribution-review?signal=${signal.id}`}>5. Review</Link>
          </div>
        </div>
        <div className="campaignCallout">
          <span>Intent summary</span>
          <strong>{signal.confidence} confidence · {signal.intentScore}/100 · {signal.status}</strong>
          <p>{signal.recommendedAction}</p>
        </div>
      </section>

      <section className="resultGrid">
        <article className="panel builderWide">
          <p className="eyebrow">Account context reminder</p>
          <div className="tagList">
            <span>{signal.source}</span>
            <span>{signal.likelyVertical}</span>
            <span>{signal.region}</span>
            <span>{signal.status}</span>
          </div>
          <p>{signal.sourceDetail}</p>
        </article>

        {signal.suggestedCampaignIdeas.map((campaignIdea) => (
          <article className="panel primaryPanel ideaCard" key={campaignIdea.id}>
            <p className="eyebrow">Campaign idea</p>
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
            <Link className="primaryLink" href={`/campaign-builder?signal=${signal.id}&idea=${campaignIdea.id}`}>Build this campaign</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
