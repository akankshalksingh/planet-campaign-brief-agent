"use client";

import { FormEvent, useState } from "react";
import { BriefView } from "@/app/components/BriefView";
import { OrbitField } from "@/app/components/OrbitField";
import { CampaignBrief } from "@/lib/types";

const examples = ["Syngenta", "Lockheed Martin", "AXA", "Port of Rotterdam", "FEMA", "BlackRock"];

export default function Home() {
  const [companyName, setCompanyName] = useState("Syngenta");
  const [brief, setBrief] = useState<CampaignBrief | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setBrief(null);

    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate brief.");
      }

      setBrief(payload.brief);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to generate brief.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <OrbitField />
        <div className="heroContent">
          <div>
            <p className="eyebrow">Planet GTM intelligence</p>
            <h1>From account signal to campaign brief in minutes.</h1>
            <p>
              A grounded campaign workflow that researches a company, detects the best-fit Planet
              vertical, retrieves approved messaging, generates a structured brief, and scores the
              output before human review.
            </p>
          </div>
          <form className="briefForm" onSubmit={handleSubmit}>
            <label htmlFor="companyName">Target account</label>
            <div className="inputRow">
              <input
                id="companyName"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Enter a company name"
                autoComplete="organization"
              />
              <button type="submit" disabled={loading || companyName.trim().length < 2}>
                {loading ? "Generating" : "Generate brief"}
              </button>
            </div>
            <div className="exampleBar" aria-label="Example companies">
              {examples.map((example) => (
                <button type="button" key={example} onClick={() => setCompanyName(example)}>
                  {example}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {error ? (
        <section className="errorPanel">
          <strong>Brief generation needs attention</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {loading ? (
        <section className="loadingPanel">
          <div className="pulse" />
          <div>
            <p className="eyebrow">Agent running</p>
            <p>Searching, classifying, retrieving approved context, generating, and evaluating.</p>
          </div>
        </section>
      ) : null}

      {brief ? <BriefView brief={brief} /> : null}

      {!brief && !loading ? (
        <section className="workflowBand">
          <div>
            <span>01</span>
            <strong>Research</strong>
            <p>Live search context with source snippets and conservative fallbacks.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Retrieve</strong>
            <p>Approved Planet vertical messaging is retrieved before generation.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Evaluate</strong>
            <p>LLM-as-judge scores relevance, specificity, groundedness, and actionability.</p>
          </div>
          <div>
            <span>04</span>
            <strong>Review</strong>
            <p>Risk flags and structured JSON keep the workflow human-approved.</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
