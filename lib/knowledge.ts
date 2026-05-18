import verticals from "@/data/planet-verticals.json";
import campaignPatterns from "@/data/planet-campaign-patterns.json";
import { CampaignPattern, PlanetVertical, PlanetVerticalName, VERTICALS } from "@/lib/types";

const documents = verticals as PlanetVertical[];
const patterns = campaignPatterns as CampaignPattern[];

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const asDocumentText = (vertical: PlanetVertical) =>
  [
    vertical.vertical,
    vertical.icp_examples.join(" "),
    vertical.customer_pain,
    vertical.how_planet_helps,
    vertical.proof_points.join(" "),
    vertical.messaging_angle,
    vertical.kpis.join(" "),
    vertical.risk_guidance
  ].join(" ");

export function isPlanetVertical(value: unknown): value is PlanetVerticalName {
  return typeof value === "string" && VERTICALS.includes(value as PlanetVerticalName);
}

export function getVertical(name: PlanetVerticalName) {
  return documents.find((item) => item.vertical === name) ?? documents[0];
}

export function retrievePlanetContext(query: string, detectedVertical?: PlanetVerticalName) {
  if (detectedVertical === "Other / Adjacent / Manual Review") {
    return documents
      .filter((item) =>
        ["Government and Civil", "Finance and Commodities", "Environmental and Climate"].includes(
          item.vertical
        )
      )
      .slice(0, 2);
  }

  const queryTerms = new Set(tokenize(`${query} ${detectedVertical ?? ""}`));

  const ranked = documents
    .map((vertical) => {
      const textTerms = tokenize(asDocumentText(vertical));
      const score =
        textTerms.reduce((total, term) => total + (queryTerms.has(term) ? 1 : 0), 0) +
        (detectedVertical === vertical.vertical ? 100 : 0);

      return { vertical, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, 2).map((item) => item.vertical);
}

export function formatVerticalContext(items: PlanetVertical[]) {
  return items
    .map(
      (item) => `Vertical: ${item.vertical}
ICP examples: ${item.icp_examples.join(", ")}
Customer pain: ${item.customer_pain}
How Planet helps: ${item.how_planet_helps}
Proof points: ${item.proof_points.join(" ")}
Messaging angle: ${item.messaging_angle}
KPIs: ${item.kpis.join(", ")}
Risk guidance: ${item.risk_guidance}`
    )
    .join("\n\n");
}

export function retrieveCampaignPatterns(detectedVertical: PlanetVerticalName) {
  const directMatches = patterns.filter((pattern) => pattern.verticals.includes(detectedVertical));

  if (directMatches.length) return directMatches.slice(0, 2);

  return patterns.filter((pattern) => pattern.verticals.includes("Other / Adjacent / Manual Review"));
}

export function formatCampaignPatterns(items: CampaignPattern[]) {
  return items
    .map(
      (item) => `Pattern: ${item.pattern_name}
Hook type: ${item.hook_type}
Core message: ${item.core_message}
Buyer pains: ${item.buyer_pains.join(", ")}
Planet capabilities: ${item.planet_capabilities.join(", ")}
Business outcomes: ${item.business_outcomes.join(", ")}
CTA styles: ${item.cta_styles.join(", ")}
Tone notes: ${item.tone_notes.join(", ")}
Reusable hooks: ${item.reusable_hooks.join(" ")}
Proof points: ${item.proof_points.join(" ")}
Avoid: ${item.avoid.join(" ")}`
    )
    .join("\n\n");
}
