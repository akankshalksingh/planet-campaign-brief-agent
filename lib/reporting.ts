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

export const demoCampaignPerformances: CampaignPerformance[] = [
  demoCampaignPerformance,
  {
    campaignId: "demo_crop_stress_2026",
    campaignName: "Crop Stress Early Warning",
    status: "active",
    dateRange: { start: "2026-06-11", end: "2026-06-11" },
    vertical: "Agriculture",
    region: "North America",
    lifecycleStage: "Consideration",
    campaignGoal: "Generate agriculture workflow demos",
    audience: "Digital agriculture, agronomy, crop intelligence, and operations leaders",
    channels: [
      { channel: "Email", owner: "Lifecycle Marketing", activationStatus: "Active", metrics: { sent: 1800, clicked: 126, demoRequests: 5, ctr: 3.8 } },
      { channel: "LinkedIn Paid", owner: "Paid Media", activationStatus: "Active", metrics: { impressions: 7200, clicks: 102, ctr: 1.4, leads: 4 } },
      { channel: "Landing Page", owner: "Web Marketing", activationStatus: "Active", metrics: { visits: 210, formsStarted: 15, formsCompleted: 9, conversionRate: 4.3 } }
    ],
    funnel: { reached: 9000, engaged: 228, demoRequests: 9, mqls: 7, sqls: 4, opportunities: 2 },
    outcomes: { meetingsBooked: 4, pipelineInfluenced: 0 },
    insight: {
      winningChannel: "Email",
      winningMessage: "Earlier crop-stress visibility for field-level decisions",
      weakestStage: "Landing page conversion",
      recommendation: "Email is producing qualified interest. Keep the early-warning message and test a landing-page proof point focused on irrigation and harvest-readiness decisions.",
      owner: "Growth Marketing"
    },
    dataMode: "demo"
  },
  {
    campaignId: "demo_dark_vessel_2026",
    campaignName: "Dark Vessel Detection",
    status: "active",
    dateRange: { start: "2026-06-11", end: "2026-06-11" },
    vertical: "Maritime",
    region: "EMEA",
    lifecycleStage: "Awareness",
    campaignGoal: "Create maritime security engagement",
    audience: "Maritime domain awareness, port security, and defense intelligence teams",
    channels: [
      { channel: "LinkedIn Paid", owner: "Paid Media", activationStatus: "Active", metrics: { impressions: 6400, clicks: 88, ctr: 1.4, leads: 3 } },
      { channel: "SDR Follow-up", owner: "Sales", activationStatus: "Sales handoff prepared", metrics: { tasksAssigned: 28, replies: 7, positiveReplies: 5, meetingsBooked: 3, replyRate: 25 } },
      { channel: "Landing Page", owner: "Web Marketing", activationStatus: "Active", metrics: { visits: 165, formsStarted: 10, formsCompleted: 6, conversionRate: 3.6 } }
    ],
    funnel: { reached: 6565, engaged: 168, demoRequests: 6, mqls: 5, sqls: 3, opportunities: 1 },
    outcomes: { meetingsBooked: 3, pipelineInfluenced: 0 },
    insight: {
      winningChannel: "SDR Follow-up",
      winningMessage: "Persistent monitoring for maritime domain awareness",
      weakestStage: "Paid-social lead conversion",
      recommendation: "SDR follow-up is strongest for maritime security. Keep paid social educational and use SDR for account-specific workflow conversations.",
      owner: "Maritime Growth"
    },
    dataMode: "demo"
  },
  {
    campaignId: "demo_infra_monitoring_2026",
    campaignName: "AI-Enhanced Infrastructure Monitoring",
    status: "draft",
    dateRange: { start: "2026-06-11", end: "2026-06-11" },
    vertical: "Government and Civil",
    region: "North America",
    lifecycleStage: "Awareness",
    campaignGoal: "Educate infrastructure resilience teams",
    audience: "Infrastructure resilience, public works, utility planning, and civil agency teams",
    channels: [
      { channel: "Email", owner: "Lifecycle Marketing", activationStatus: "Awaiting approval", metrics: { sent: 0, clicked: 0, demoRequests: 0, ctr: 0 } },
      { channel: "Webinar", owner: "Growth Marketing", activationStatus: "Scheduled", metrics: { registrations: 86, attendees: 0, demoRequests: 0 } },
      { channel: "Landing Page", owner: "Web Marketing", activationStatus: "Web update requested", metrics: { visits: 74, formsStarted: 4, formsCompleted: 2, conversionRate: 2.7 } }
    ],
    funnel: { reached: 74, engaged: 4, demoRequests: 2, mqls: 1, sqls: 0, opportunities: 0 },
    outcomes: { meetingsBooked: 0, pipelineInfluenced: 0 },
    insight: {
      winningChannel: "Webinar",
      winningMessage: "Infrastructure monitoring as executive education",
      weakestStage: "SQL conversion",
      recommendation: "This campaign is still early. Prioritize webinar attendance and add a clearer operational monitoring use case before SDR outreach.",
      owner: "Public Sector Marketing"
    },
    dataMode: "demo"
  }
];
