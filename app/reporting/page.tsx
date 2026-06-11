import Link from "next/link";
import { OrbitField } from "@/app/components/OrbitField";
import { CampaignPerformance, demoCampaignPerformances } from "@/lib/reporting";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function conversion(from: number, to: number) {
  if (!from) return "0%";
  return `${((to / from) * 100).toFixed(1)}%`;
}

function sumMetric(campaigns: CampaignPerformance[], metric: keyof CampaignPerformance["funnel"]) {
  return campaigns.reduce((total, campaign) => total + campaign.funnel[metric], 0);
}

function channelTotal(campaigns: CampaignPerformance[], channelName: string, metric: string) {
  return campaigns.reduce((total, campaign) => {
    const channel = campaign.channels.find((item) => item.channel === channelName);
    return total + (channel?.metrics[metric] ?? 0);
  }, 0);
}

export default function ReportingPage() {
  const campaigns = demoCampaignPerformances;
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active").length;
  const reached = sumMetric(campaigns, "reached");
  const engaged = sumMetric(campaigns, "engaged");
  const demoRequests = sumMetric(campaigns, "demoRequests");
  const mqls = sumMetric(campaigns, "mqls");
  const sqls = sumMetric(campaigns, "sqls");
  const opportunities = sumMetric(campaigns, "opportunities");
  const meetingsBooked = campaigns.reduce((total, campaign) => total + campaign.outcomes.meetingsBooked, 0);
  const channelsActivated = Array.from(new Set(campaigns.flatMap((campaign) => campaign.channels.map((channel) => channel.channel))));
  const channelRows = [
    {
      channel: "Email",
      activated: `${formatNumber(channelTotal(campaigns, "Email", "sent"))} sent`,
      engagement: `${formatNumber(channelTotal(campaigns, "Email", "clicked"))} clicks`,
      conversion: `${conversion(channelTotal(campaigns, "Email", "sent"), channelTotal(campaigns, "Email", "clicked"))} CTR`,
      outcome: `${channelTotal(campaigns, "Email", "demoRequests")} demo requests`
    },
    {
      channel: "LinkedIn Paid",
      activated: `${formatNumber(channelTotal(campaigns, "LinkedIn Paid", "impressions"))} impressions`,
      engagement: `${formatNumber(channelTotal(campaigns, "LinkedIn Paid", "clicks"))} clicks`,
      conversion: `${conversion(channelTotal(campaigns, "LinkedIn Paid", "impressions"), channelTotal(campaigns, "LinkedIn Paid", "clicks"))} CTR`,
      outcome: `${channelTotal(campaigns, "LinkedIn Paid", "leads")} leads`
    },
    {
      channel: "SDR Follow-up",
      activated: `${formatNumber(channelTotal(campaigns, "SDR Follow-up", "tasksAssigned"))} assigned`,
      engagement: `${formatNumber(channelTotal(campaigns, "SDR Follow-up", "replies"))} replies`,
      conversion: `${conversion(channelTotal(campaigns, "SDR Follow-up", "tasksAssigned"), channelTotal(campaigns, "SDR Follow-up", "replies"))} reply rate`,
      outcome: `${channelTotal(campaigns, "SDR Follow-up", "meetingsBooked")} meetings`
    },
    {
      channel: "Landing Page",
      activated: `${formatNumber(channelTotal(campaigns, "Landing Page", "visits"))} visits`,
      engagement: `${formatNumber(channelTotal(campaigns, "Landing Page", "formsStarted"))} form starts`,
      conversion: `${conversion(channelTotal(campaigns, "Landing Page", "visits"), channelTotal(campaigns, "Landing Page", "formsCompleted"))} conversion`,
      outcome: `${channelTotal(campaigns, "Landing Page", "formsCompleted")} requests`
    }
  ];
  const funnel = [
    ["Reached", reached],
    ["Engaged", engaged],
    ["Demo requests", demoRequests],
    ["MQLs", mqls],
    ["SQLs", sqls],
    ["Opportunities", opportunities]
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
            <h2>Today’s GTM campaign report</h2>
            <p>{campaigns.length} campaigns · {activeCampaigns} active · {channelsActivated.length} channels activated</p>
            <span className="demoBadge">Demo performance data</span>
          </div>
          <dl className="inlineFacts">
            <div><dt>Date range</dt><dd>Today · June 11, 2026</dd></div>
            <div><dt>Campaigns running</dt><dd>{campaigns.length}</dd></div>
            <div><dt>Active campaigns</dt><dd>{activeCampaigns}</dd></div>
            <div><dt>Channels</dt><dd>{channelsActivated.join(", ")}</dd></div>
          </dl>
          <div className="reportFilters">
            <label>Date range<select defaultValue="Today"><option>Today</option><option>June 1-30, 2026</option></select></label>
            <label>Channel<select defaultValue="All"><option>All</option>{channelsActivated.map((channel) => <option key={channel}>{channel}</option>)}</select></label>
            <label>Audience<select defaultValue="All"><option>All</option>{campaigns.map((campaign) => <option key={campaign.campaignId}>{campaign.audience}</option>)}</select></label>
            <label>Region<select defaultValue="All"><option>All</option>{Array.from(new Set(campaigns.map((campaign) => campaign.region))).map((region) => <option key={region}>{region}</option>)}</select></label>
          </div>
        </article>

        <article className="panel builderWide">
          <p className="eyebrow">Key results</p>
          <div className="kpiGrid">
            <div><span>People reached</span><strong>{formatNumber(reached)}</strong></div>
            <div><span>Qualified engagements</span><strong>{formatNumber(engaged)}</strong></div>
            <div><span>Demo requests</span><strong>{demoRequests}</strong></div>
            <div><span>SDR replies</span><strong>{channelTotal(campaigns, "SDR Follow-up", "replies")}</strong></div>
            <div><span>Meetings booked</span><strong>{meetingsBooked}</strong></div>
            <div><span>Pipeline influenced</span><strong>Demo data</strong></div>
          </div>
        </article>

        <article className="panel builderWide">
          <p className="eyebrow">Campaigns run today</p>
          <div className="performanceTable campaignTable">
            <div className="tableHeader">
              <span>Campaign</span>
              <span>Status</span>
              <span>Vertical</span>
              <span>Demo requests</span>
              <span>Next action</span>
            </div>
            {campaigns.map((campaign) => (
              <div key={campaign.campaignId}>
                <strong>{campaign.campaignName}</strong>
                <span>{campaign.status}</span>
                <span>{campaign.vertical}</span>
                <span>{campaign.funnel.demoRequests}</span>
                <span>{campaign.insight.weakestStage}</span>
              </div>
            ))}
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
          <p>
            SDR follow-up is producing the strongest meeting rate today, while paid media is creating reach but weaker demo conversion.
            Keep the account-specific SDR motion active and test sharper LinkedIn hooks tied to the highest-intent use case in each vertical.
          </p>
          <dl className="inlineFacts">
            <div><dt>Winning channel</dt><dd>SDR Follow-up</dd></div>
            <div><dt>Winning message</dt><dd>Earlier evidence for operational decisions</dd></div>
            <div><dt>Weakest stage</dt><dd>Paid-social click-to-demo conversion</dd></div>
            <div><dt>Owner</dt><dd>Growth Marketing</dd></div>
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
