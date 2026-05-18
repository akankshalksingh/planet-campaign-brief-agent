import { NextResponse } from "next/server";
import { runCampaignIdeaAgent } from "@/lib/campaignIdeaAgent";
import { campaignIdeaRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = campaignIdeaRequestSchema.parse(body);
    const result = await runCampaignIdeaAgent({
      campaignIdea: input.campaignIdea,
      optionalTargetAccount: input.optionalTargetAccount ?? "",
      relationshipType: input.relationshipType,
      campaignGoal: input.campaignGoal
    });

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to generate campaign strategy. Fallback mode may be unavailable; please review inputs and try again."
      },
      { status: 400 }
    );
  }
}
