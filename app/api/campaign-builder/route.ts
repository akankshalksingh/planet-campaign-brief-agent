import { NextResponse } from "next/server";
import { runCampaignBuilder } from "@/lib/campaign-builder/runCampaignBuilder";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await runCampaignBuilder(payload);

    return NextResponse.json({
      success: true,
      data: result.data,
      fallbackMode: result.fallbackMode,
      warning: result.warning
    });
  } catch (error) {
    const details =
      error && typeof error === "object" && "issues" in error
        ? (error as { issues?: unknown }).issues
        : [];

    return NextResponse.json(
      {
        success: false,
        error: "Invalid campaign input",
        details
      },
      { status: 400 }
    );
  }
}
