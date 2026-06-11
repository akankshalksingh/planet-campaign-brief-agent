import { z } from "zod";

export const CampaignPerformanceSchema = z.object({
  campaignId: z.string(),
  campaignName: z.string(),
  status: z.enum(["draft", "active", "completed"]),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }),
  vertical: z.string(),
  region: z.string(),
  lifecycleStage: z.string(),
  campaignGoal: z.string(),
  audience: z.string(),
  channels: z.array(
    z.object({
      channel: z.string(),
      owner: z.string(),
      activationStatus: z.string(),
      metrics: z.record(z.string(), z.number())
    })
  ),
  funnel: z.object({
    reached: z.number(),
    engaged: z.number(),
    demoRequests: z.number(),
    mqls: z.number(),
    sqls: z.number(),
    opportunities: z.number()
  }),
  outcomes: z.object({
    meetingsBooked: z.number(),
    pipelineInfluenced: z.number().optional()
  }),
  insight: z.object({
    winningChannel: z.string(),
    winningMessage: z.string(),
    weakestStage: z.string(),
    recommendation: z.string(),
    owner: z.string()
  }),
  dataMode: z.enum(["demo", "live"])
});

export type CampaignPerformance = z.infer<typeof CampaignPerformanceSchema>;

export const demoCampaignPerformance: CampaignPerformance = {
  campaignId: "demo_wildfire_readiness_2026",
  campaignName: "Wildfire Risk Readiness",
  status: "active",
  dateRange: {
    start: "2026-06-01",
    end: "2026-06-30"
  },
  vertical: "Insurance & Risk",
  region: "North America",
  lifecycleStage: "Consideration",
  campaignGoal: "Generate qualified demo requests",
  audience: "Insurance risk teams, climate-risk analysts, and resilience teams",
  channels: [
    {
      channel: "Email",
      owner: "Marketing Operations",
      activationStatus: "Awaiting approval",
      metrics: {
        sent: 2400,
        delivered: 2328,
        opened: 912,
        clicked: 184,
        replied: 9,
        demoRequests: 7,
        ctr: 4.2
      }
    },
    {
      channel: "LinkedIn Paid",
      owner: "Paid Media",
      activationStatus: "Paid-media review",
      metrics: {
        impressions: 9800,
        clicks: 121,
        ctr: 1.2,
        landingPageVisits: 96,
        leads: 5
      }
    },
    {
      channel: "SDR Follow-up",
      owner: "Sales",
      activationStatus: "Sales handoff prepared",
      metrics: {
        tasksAssigned: 42,
        prospectsContacted: 39,
        replies: 11,
        positiveReplies: 8,
        meetingsBooked: 6,
        replyRate: 26
      }
    },
    {
      channel: "Landing Page",
      owner: "Web Marketing",
      activationStatus: "Web update requested",
      metrics: {
        visits: 305,
        ctaClicks: 44,
        formsStarted: 22,
        formsCompleted: 18,
        conversionRate: 5.9
      }
    }
  ],
  funnel: {
    reached: 12480,
    engaged: 326,
    demoRequests: 18,
    mqls: 12,
    sqls: 7,
    opportunities: 3
  },
  outcomes: {
    meetingsBooked: 6,
    pipelineInfluenced: 0
  },
  insight: {
    winningChannel: "SDR Follow-up",
    winningMessage: "Earlier wildfire-risk evidence for regional planning",
    weakestStage: "LinkedIn click-to-demo conversion",
    recommendation:
      "SDR follow-up generated the strongest meeting rate, while LinkedIn produced reach but weaker conversion. Continue the risk-readiness message in SDR outreach and test a more specific LinkedIn hook focused on claims triage or regional exposure monitoring.",
    owner: "Growth Marketing"
  },
  dataMode: "demo"
};
