import Link from "next/link";
import { notFound } from "next/navigation";
import { OrbitField } from "@/app/components/OrbitField";
import { SignalIdeaWorkspace } from "@/app/components/SignalIdeaWorkspace";
import { getSignalById } from "@/lib/signals";

export default async function SignalIdeasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const signal = getSignalById(id);
  if (!signal) notFound();

  return (
    <main>
      <section className="signalDetailHero">
        <OrbitField />
        <div className="signalDetailHeroContent">
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
        </div>
      </section>

      <SignalIdeaWorkspace signal={signal} />
    </main>
  );
}
