import verticals from "@/data/planet-verticals.json";
import { PlanetVertical, PlanetVerticalName, VERTICALS } from "@/lib/types";

const documents = verticals as PlanetVertical[];

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
