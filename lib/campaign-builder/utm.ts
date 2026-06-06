import utmRules from "@/data/utm-rules.json";
import { CampaignBuilderChannel, CampaignBuilderInput, CampaignBuilderOutput } from "@/lib/campaign-builder/schemas";

type UTMChannelRule = {
  source: string;
  medium: string;
  contentPrefix: string;
};

const rules = utmRules as {
  campaignPrefix: string;
  channels: Record<CampaignBuilderChannel, UTMChannelRule>;
};

export function slugifyCampaignName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function addParams(url: string, params: Record<string, string | undefined>) {
  try {
    const parsed = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value) parsed.searchParams.set(key, value);
    });
    return parsed.toString();
  } catch {
    const query = new URLSearchParams(
      Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))
    );
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${query.toString()}`;
  }
}

function validateUtmLink(input: CampaignBuilderInput, channel: CampaignBuilderChannel, params: Record<string, string>) {
  const issues: string[] = [];
  let status: "valid" | "warning" | "error" = "valid";

  if (!input.landingPageUrl.trim()) {
    issues.push("Missing landing page URL.");
    status = "error";
  }

  ["utm_source", "utm_medium", "utm_campaign"].forEach((field) => {
    if (!params[field]) {
      issues.push(`Missing ${field}.`);
      status = "error";
    }
  });

  if (!params.utm_content) {
    issues.push("Missing utm_content.");
    status = status === "error" ? "error" : "warning";
  }

  if (/\s|[A-Z]/.test(params.utm_campaign)) {
    issues.push("Campaign value should be normalized lowercase snake case.");
    status = status === "error" ? "error" : "warning";
  }

  if (channel === "Paid Search" && !params.utm_term) {
    issues.push("Paid Search should include utm_term before launch.");
    status = status === "error" ? "error" : "warning";
  }

  return { status, issues };
}

export function generateUtmLinks(input: CampaignBuilderInput, campaignName: string): CampaignBuilderOutput["utmLinks"] {
  const campaignSlug = slugifyCampaignName(campaignName || input.campaignIdea);
  const utmCampaign = `${rules.campaignPrefix}_${campaignSlug}`;

  return input.channels.map((channel) => {
    const rule = rules.channels[channel];
    const content = `${rule.contentPrefix}_${slugifyCampaignName(input.lifecycleStage || "consideration")}`;
    const params: Record<string, string> = {
      utm_source: rule.source,
      utm_medium: rule.medium,
      utm_campaign: utmCampaign,
      utm_content: content
    };

    if (channel === "Paid Search") {
      params.utm_term = slugifyCampaignName(input.campaignIdea);
    }

    return {
      channel,
      asset: `${channel} ${input.lifecycleStage || "Consideration"}`,
      url: addParams(input.landingPageUrl, params),
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign,
      utm_content: params.utm_content,
      utm_term: params.utm_term,
      validation: validateUtmLink(input, channel, params)
    };
  });
}
