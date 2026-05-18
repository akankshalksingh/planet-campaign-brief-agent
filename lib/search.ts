import { CompanyContext, SearchSnippet } from "@/lib/types";

type TavilyResponse = {
  answer?: string;
  results?: Array<{ title?: string; url?: string; content?: string }>;
};

type DuckDuckGoResponse = {
  AbstractText?: string;
  AbstractURL?: string;
  Heading?: string;
  RelatedTopics?: Array<
    | { Text?: string; FirstURL?: string }
    | { Topics?: Array<{ Text?: string; FirstURL?: string }> }
  >;
};

const curatedContext: Record<string, SearchSnippet[]> = {
  syngenta: [
    {
      title: "Syngenta agriculture technology profile",
      url: "https://www.syngenta.com/",
      snippet:
        "Syngenta is a global agriculture company focused on crop protection, seeds, and digital farming capabilities such as Cropwise.",
      source: "curated"
    }
  ],
  "lockheed martin": [
    {
      title: "Lockheed Martin company profile",
      url: "https://www.lockheedmartin.com/",
      snippet:
        "Lockheed Martin is a global aerospace and defense company serving government and defense customers.",
      source: "curated"
    }
  ],
  axa: [
    {
      title: "AXA insurance profile",
      url: "https://www.axa.com/",
      snippet:
        "AXA is a global insurance and asset management group with exposure to property, casualty, risk, and climate resilience workflows.",
      source: "curated"
    }
  ],
  fema: [
    {
      title: "FEMA agency profile",
      url: "https://www.fema.gov/",
      snippet:
        "FEMA coordinates federal disaster response and recovery support across the United States.",
      source: "curated"
    }
  ],
  "port of rotterdam": [
    {
      title: "Port of Rotterdam profile",
      url: "https://www.portofrotterdam.com/",
      snippet:
        "The Port of Rotterdam is a major European port and logistics hub with maritime, shipping, and supply chain visibility needs.",
      source: "curated"
    }
  ],
  blackrock: [
    {
      title: "BlackRock company profile",
      url: "https://www.blackrock.com/",
      snippet:
        "BlackRock is a global investment management firm that uses research and data to support portfolio and risk decisions.",
      source: "curated"
    }
  ]
};

function normalizeCompany(companyName: string) {
  return companyName.toLowerCase().trim();
}

async function searchWithTavily(companyName: string): Promise<SearchSnippet[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: `${companyName} company overview industry recent business signals`,
      search_depth: "basic",
      max_results: 5,
      include_answer: true
    })
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as TavilyResponse;
  return (payload.results ?? []).slice(0, 5).map((item) => ({
    title: item.title ?? "Search result",
    url: item.url ?? "#",
    snippet: item.content ?? "",
    source: "tavily" as const
  }));
}

async function searchWithDuckDuckGo(companyName: string): Promise<SearchSnippet[]> {
  const url = new URL("https://api.duckduckgo.com/");
  url.searchParams.set("q", `${companyName} company`);
  url.searchParams.set("format", "json");
  url.searchParams.set("no_html", "1");
  url.searchParams.set("skip_disambig", "1");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as DuckDuckGoResponse;
  const snippets: SearchSnippet[] = [];

  if (payload.AbstractText) {
    snippets.push({
      title: payload.Heading || `${companyName} overview`,
      url: payload.AbstractURL || "https://duckduckgo.com/",
      snippet: payload.AbstractText,
      source: "duckduckgo"
    });
  }

  for (const topic of payload.RelatedTopics ?? []) {
    if ("Text" in topic && topic.Text) {
      snippets.push({
        title: topic.Text.split(" - ")[0] ?? "Related result",
        url: topic.FirstURL ?? "https://duckduckgo.com/",
        snippet: topic.Text,
        source: "duckduckgo"
      });
    }
  }

  return snippets.slice(0, 5);
}

export async function searchCompany(companyName: string): Promise<CompanyContext> {
  const tavily = await searchWithTavily(companyName);
  const duck = tavily.length ? [] : await searchWithDuckDuckGo(companyName);
  const curated = curatedContext[normalizeCompany(companyName)] ?? [];
  const snippets = [...tavily, ...duck, ...curated].filter((item) => item.snippet).slice(0, 6);
  const searchQuality = tavily.length || duck.length ? "live" : curated.length ? "fallback" : "weak";

  const fallbackSnippet: SearchSnippet = {
    title: "User-provided company name",
    url: "#",
    snippet:
      "Live search did not return strong context. Treat this company as ambiguous and keep the brief conservative.",
    source: "curated"
  };

  const finalSnippets = snippets.length ? snippets : [fallbackSnippet];

  return {
    query: companyName,
    summary: finalSnippets.map((item) => `${item.title}: ${item.snippet}`).join("\n"),
    snippets: finalSnippets,
    searchQuality,
    generatedAt: new Date().toISOString()
  };
}
