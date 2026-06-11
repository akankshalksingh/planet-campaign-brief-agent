import Link from "next/link";
import { OrbitField } from "@/app/components/OrbitField";
import { demoCampaignPerformance } from "@/lib/reporting";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `${formatter.format(new Date(`${start}T00:00:00`))} - ${formatter.format(new Date(`${end}T00:00:00`))}`;
}

function conversion(from: number, to: number) {
  if (!from) return "0%";
  return `${((to / from) * 100).toFixed(1)}%`;
}

export default function ReportingPage() {
  const performance = demoCampaignPerformance;
  const email = performance.channels.find((item) => item.channel === "Email");
  const linkedin = performance.channels.find((item) => item.channel === "LinkedIn Paid");
  const sdr = performance.channels.find((item) => item.channel === "SDR Follow-up");
  const landing = performance.channels.find((item) => item.channel === "Landing Page");
  const channelRows = [
    {
      channel: "Email",
      activated: `${formatNumber(email?.metrics.sent ?? 0)} sent`,
      engagement: `${formatNumber(email?.metrics.clicked ?? 0)} clicks`,
      conversion: `${email?.metrics.ctr ?? 0}% CTR`,
      outcome: `${email?.metrics.demoRequests ?? 0} demo requests`
    },
    {
      channel: "LinkedIn Paid",
      activated: `${formatNumber(linkedin?.metrics.impressions ?? 0)} impressions`,
      engagement: `${formatNumber(linkedin?.metrics.clicks ?? 0)} clicks`,
      conversion: `${linkedin?.metrics.ctr ?? 0}% CTR`,
      outcome: `${linkedin?.metrics.leads ?? 0} leads`
    },
    {
      channel: "SDR Follow-up",
      activated: `${formatNumber(sdr?.metrics.tasksAssigned ?? 0)} assigned`,
      engagement: `${formatNumber(sdr?.metrics.replies ?? 0)} replies`,
      conversion: `${sdr?.metrics.replyRate ?? 0}% reply rate`,
      outcome: `${sdr?.metrics.meetingsBooked ?? 0} meetings`
    },
    {
      channel: "Landing Page",
      activated: `${formatNumber(landing?.metrics.visits ?? 0)} visits`,
      engagement: `${formatNumber(landing?.metrics.formsStarted ?? 0)} form starts`,
      conversion: `${landing?.metrics.conversionRate ?? 0}% conversion`,
      outcome: `${landing?.metrics.formsCompleted ?? 0} requests`
    }
  ];
  const funnel = [
    ["Reached", performance.funnel.reached],
    ["Engaged", performance.funnel.engaged],
    ["Demo requests", performance.funnel.demoRequests],
    ["MQLs", performance.funnel.mqls],
    ["SQLs", performance.funnel.sqls],
    ["Opportunities", performance.funnel.opportunities]
  ] as const;

  return (
    <main>
      <section className="signalHero">
        <OrbitField />
        <div className="signalHeroContent">
          <p className="eyebrow">GTM Reporting</p>
          <h1>Campaign performance</h1>
          <p>Track what was activated, how audiences engaged, and what moved the campaign forward.</p>
          <div className="modeLinks workflowNav">
            <Link href="/signals">1. Signals</Link>
            <Link href="/">2. Account</Link>
            <Link href="/campaign-idea">3. Ideas</Link>
            <Link href="/campaign-builder">4. Build</Link>
            <Link href="/reporting" className="activeLink">5. Reporting</Link>
          </div>
        </div>
      </section>

      <section className="reportingGrid">
        <article className="panel primaryPanel reportingOverview">
          <div>
            <p className="eyebrow">Campaign overview</p>
            <h2>{performance.campaignName}</h2>
            <p>{performance.vertical} · {performance.region} · {performance.lifecycleStage}</p>
            <span className="demoBadge">Demo performance data</span>
          </div>
          <dl className="inlineFacts">
            <div><dt>Status</dt><dd>{performance.status}</dd></div>
            <div><dt>Date range</dt><dd>{formatDateRange(performance.dateRange.start, performance.dateRange.end)}</dd></div>
            <div><dt>Goal</dt><dd>{performance.campaignGoal}</dd></div>
            <div><dt>Channels</dt><dd>{performance.channels.map((item) => item.channel).join(", ")}</dd></div>
          </dl>
          <div className="reportFilters">
            <label>Date range<select defaultValue="June 1-30, 2026"><option>June 1-30, 2026</option></select></label>
            <label>Channel<select defaultValue="All"><option>All</option><option>Email</option><option>LinkedIn Paid</option><option>SDR Follow-up</option><option>Landing Page</option></select></label>
            <label>Audience<select defaultValue="All"><option>All</option><option>{performance.audience}</option></select></label>
            <label>Region<select defaultValue={performance.region}><option>{performance.region}</option></select></label>
          </div>
        </article>

        <article className="panel builderWide">
          <p className="eyebrow">Key results</p>
          <div className="kpiGrid">
            <div><span>People reached</span><strong>{formatNumber(performance.funnel.reached)}</strong></div>
            <div><span>Qualified engagements</span><strong>{formatNumber(performance.funnel.engaged)}</strong></div>
            <div><span>Demo requests</span><strong>{performance.funnel.demoRequests}</strong></div>
            <div><span>SDR replies</span><strong>{sdr?.metrics.replies ?? 0}</strong></div>
            <div><span>Meetings booked</span><strong>{performance.outcomes.meetingsBooked}</strong></div>
            <div><span>Pipeline influenced</span><strong>Demo data</strong></div>
          </div>
        </article>

        <article className="panel builderWide">
          <p className="eyebrow">Channel performance</p>
          <div className="performanceTable">
            <div className="tableHeader">
              <span>Channel</span>
              <span>Activated</span>
              <span>Engagement</span>
              <span>Conversion</span>
              <span>Outcome</span>
            </div>
            {channelRows.map((row) => (
              <div key={row.channel}>
                <strong>{row.channel}</strong>
                <span>{row.activated}</span>
                <span>{row.engagement}</span>
                <span>{row.conversion}</span>
                <span>{row.outcome}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel builderWide">
          <p className="eyebrow">Funnel outcomes</p>
          <div className="funnelRow">
            {funnel.map(([label, value], index) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{formatNumber(value)}</strong>
                {index < funnel.length - 1 ? <em>{conversion(value, funnel[index + 1][1])} to next</em> : <em>created</em>}
              </div>
            ))}
          </div>
        </article>

        <article className="panel primaryPanel builderWide">
          <p className="eyebrow">Recommended next action</p>
          <h3>What the team should do next</h3>
          <p>{performance.insight.recommendation}</p>
          <dl className="inlineFacts">
            <div><dt>Winning channel</dt><dd>{performance.insight.winningChannel}</dd></div>
            <div><dt>Winning message</dt><dd>{performance.insight.winningMessage}</dd></div>
            <div><dt>Weakest stage</dt><dd>{performance.insight.weakestStage}</dd></div>
            <div><dt>Owner</dt><dd>{performance.insight.owner}</dd></div>
          </dl>
          <div className="builderPrimaryActions">
            <Link className="primaryAction" href="/campaign-idea">Create follow-up campaign</Link>
            <button type="button" className="secondaryAction">Send insight to campaign owner</button>
            <Link className="secondaryAction" href="/campaign-builder">Return to Campaign Builder</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
