import { NextResponse } from "next/server";
import { runCampaignBriefAgent } from "@/lib/agent";
import { requestSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName } = requestSchema.parse(body);
    const brief = await runCampaignBriefAgent(companyName);

    return NextResponse.json({ brief });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    const status = message.includes("GEMINI_API_KEY") ? 500 : 400;

    return NextResponse.json(
      {
        error: message
      },
      { status }
    );
  }
}
