import { CampaignBuilderInput, CampaignBuilderOutput } from "@/lib/campaign-builder/schemas";

export function buildLaunchChecklist(input: CampaignBuilderInput): CampaignBuilderOutput["launchChecklist"] {
  const owner = input.campaignOwner || "Growth Marketing";
  const hasSdr = input.channels.includes("SDR Follow-up");

  return [
    {
      category: "Strategy",
      item: "Campaign goal, audience, CTA, and lifecycle stage defined",
      status: "done" as const,
      owner,
      notes: "Inputs are captured in the campaign package."
    },
    {
      category: "Creative",
      item: "Email, paid social, SDR, and landing page copy reviewed",
      status: "needs_review" as const,
      owner,
      notes: "AI-generated assets require final brand and legal review."
    },
    {
      category: "Audience",
      item: "Segment logic and suppression rules confirmed",
      status: "needs_review" as const,
      owner: "Marketing Ops",
      notes: "Confirm audience list, region, exclusions, and consent rules."
    },
    {
      category: "Marketing Ops",
      item: "UTM links generated and checked",
      status: input.landingPageUrl.trim() ? "done" as const : "missing" as const,
      owner: "Marketing Ops",
      notes: "Generated locally from channel rules; confirm final naming before launch."
    },
    {
      category: "Marketing Ops",
      item: "Salesforce Campaign ID mapped",
      status: "missing" as const,
      owner: "Marketing Ops",
      notes: "Create or map campaign in Salesforce before activation."
    },
    {
      category: "Marketing Ops",
      item: "Marketo Program ID mapped",
      status: "missing" as const,
      owner: "Marketing Ops",
      notes: "Create or map program before email deployment."
    },
    {
      category: "Sales Handoff",
      item: "SDR owner and follow-up motion confirmed",
      status: hasSdr && input.campaignOwner ? "needs_review" as const : "missing" as const,
      owner: hasSdr ? "Sales" : "Growth Marketing",
      notes: hasSdr ? "Confirm handoff owner, SLA, and approved talk track." : "Not selected unless SDR channel is added."
    },
    {
      category: "Measurement",
      item: "Primary KPI and campaign member statuses confirmed",
      status: "needs_review" as const,
      owner: "Marketing Ops",
      notes: "Use inquiry, MQL, demo request, meeting booked, and influenced pipeline statuses where appropriate."
    },
    {
      category: "Human Review",
      item: "External copy, claims, and sensitive use case language reviewed",
      status: "needs_review" as const,
      owner,
      notes: "Human approval required before external outreach."
    }
  ];
}
