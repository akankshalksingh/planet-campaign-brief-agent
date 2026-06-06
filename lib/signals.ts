import { CampaignBuilderChannel, CampaignBuilderInput } from "@/lib/campaign-builder/schemas";

export type SignalSource =
  | "Marketo Web Activity"
  | "Salesforce Campaign Member"
  | "SplashThat Event Scan"
  | "LinkedIn Paid"
  | "Google Ads"
  | "Product Freemium App"
  | "Webinar Attendance"
  | "Content Download"
  | "Website Demo Form"
  | "Newsletter Engagement"
  | "Partner Referral"
  | "Clay Enrichment"
  | "6sense Account Intent"
  | "Bombora Intent"
  | "Gainsight Community"
  | "API Docs Visit"
  | "SDR Note"
  | "CSV Event Upload"
  | "Organic Social"
  | "Customer Expansion Signal";

export type SignalVertical =
  | "Agriculture"
  | "Insurance & Risk"
  | "Government & Civil"
  | "Defense & Intelligence"
  | "Maritime"
  | "Environmental & Climate"
  | "Energy & Infrastructure"
  | "Mapping & GIS"
  | "Platform / Developer"
  | "Other / Adjacent / Manual Review";

export type Confidence = "Very High" | "High" | "Medium" | "Low";
export type SignalStatus =
  | "New"
  | "Needs Enrichment"
  | "Ready for Campaign Ideas"
  | "Sales Ready"
  | "Nurture Only"
  | "Manual Review";

export type SignalEvent = {
  date: string;
  eventType: string;
  description: string;
  weight: number;
};

export type SignalReviewFlag = {
  severity: "High" | "Medium" | "Low";
  title: string;
  detail: string;
};

export type CampaignIdeaSeed = {
  id: string;
  name: string;
  theme: string;
  useCase: string;
  bestChannels: string[];
  cta: string;
  fitScore: number;
  reviewNote: string;
};

export type LeadSignal = {
  id: string;
  accountName: string;
  accountDomain: string;
  personName: string;
  personTitle: string;
  personEmail: string;
  source: SignalSource;
  sourceDetail: string;
  region: string;
  industry: string;
  companySize: string;
  observedBehavior: string[];
  behaviorTimeline: SignalEvent[];
  intentScore: number;
  confidence: Confidence;
  status: SignalStatus;
  likelyVertical: SignalVertical;
  likelyUseCase: string;
  recommendedAction: string;
  routingSuggestion: string;
  reviewFlags: SignalReviewFlag[];
  suggestedCampaignIdeas: CampaignIdeaSeed[];
};

const idea = (
  id: string,
  name: string,
  theme: string,
  useCase: string,
  bestChannels: string[],
  cta: string,
  fitScore: number,
  reviewNote: string
): CampaignIdeaSeed => ({ id, name, theme, useCase, bestChannels, cta, fitScore, reviewNote });

const timeline = (items: Array<[string, string, string, number]>): SignalEvent[] =>
  items.map(([date, eventType, description, weight]) => ({ date, eventType, description, weight }));

export const leadSignals: LeadSignal[] = [
  {
    id: "sig_001",
    accountName: "AllTrails",
    accountDomain: "alltrails.com",
    personName: "Maya Chen",
    personTitle: "Senior Growth Marketing Manager",
    personEmail: "maya.chen@alltrails.com",
    source: "Marketo Web Activity",
    sourceDetail: "Repeated website engagement on climate-risk and environmental monitoring pages",
    region: "North America",
    industry: "Outdoor Recreation / Consumer Technology",
    companySize: "201-500",
    observedBehavior: [
      "Visited Planet climate-risk page 10 times in 7 days",
      "Clicked wildfire-risk LinkedIn ad",
      "Viewed environmental monitoring content",
      "Returned to the site 3 times after initial click",
      "No demo request submitted yet"
    ],
    behaviorTimeline: timeline([
      ["2026-06-01", "LinkedIn Click", "Clicked wildfire-risk paid social ad", 12],
      ["2026-06-02", "Page Visit", "Viewed climate-risk solution page 4 times", 18],
      ["2026-06-04", "Return Visit", "Returned and viewed environmental monitoring page", 14]
    ]),
    intentScore: 84,
    confidence: "High",
    status: "Ready for Campaign Ideas",
    likelyVertical: "Other / Adjacent / Manual Review",
    likelyUseCase: "Outdoor safety intelligence, environmental monitoring, wildfire exposure, partner ecosystem",
    recommendedAction: "Review as adjacent account and generate campaign ideas before any outreach",
    routingSuggestion: "Growth Marketing review before SDR handoff",
    reviewFlags: [
      { severity: "Medium", title: "Adjacent account", detail: "Do not force into core Insurance or Government vertical without validation." },
      { severity: "Medium", title: "Messaging sensitivity", detail: "Avoid implying consumer safety claims or emergency response capability." }
    ],
    suggestedCampaignIdeas: [
      idea("idea_alltrails_1", "Trail Risk Visibility", "Help outdoor platforms understand environmental change around high-traffic trail areas.", "Wildfire exposure, flood risk, drought stress, vegetation change, and post-event trail-area visibility.", ["Email", "LinkedIn Paid", "SDR Follow-up"], "Explore climate-risk workflows", 72, "Adjacent account; human review required."),
      idea("idea_alltrails_2", "Outdoor Safety Intelligence", "Turn changing ground conditions into earlier safety and planning signals.", "Monitor wildfire-prone zones, access changes after storms, vegetation shifts, and seasonal land conditions.", ["LinkedIn Paid", "Landing Page", "SDR Follow-up"], "Request a demo", 78, "Keep messaging focused on operational visibility, not consumer safety guarantees."),
      idea("idea_alltrails_3", "Partner Ecosystem Campaign", "Use Planet data to support recreation partners, land managers, agencies, and conservation teams.", "Partner ecosystem, public lands monitoring, and resilience planning.", ["Webinar", "Email", "Organic Social"], "Start a conversation", 81, "Safest path because it does not over-force AllTrails into a core vertical.")
    ]
  },
  {
    id: "sig_002",
    accountName: "AXA Climate",
    accountDomain: "axa.com",
    personName: "Julien Moreau",
    personTitle: "Climate Risk Analytics Lead",
    personEmail: "julien.moreau@axa.com",
    source: "Webinar Attendance",
    sourceDetail: "Attended wildfire risk webinar and downloaded follow-up asset",
    region: "Europe / North America",
    industry: "Insurance",
    companySize: "10,001+",
    observedBehavior: ["Attended 42 minutes of climate-risk webinar", "Downloaded wildfire exposure brief", "Visited claims monitoring page twice", "Clicked demo CTA but did not submit form"],
    behaviorTimeline: timeline([
      ["2026-06-01", "Webinar Attend", "Attended wildfire risk webinar for 42 minutes", 25],
      ["2026-06-01", "Content Download", "Downloaded wildfire exposure brief", 18],
      ["2026-06-03", "CTA Click", "Clicked Request Demo CTA without submitting form", 14]
    ]),
    intentScore: 91,
    confidence: "Very High",
    status: "Sales Ready",
    likelyVertical: "Insurance & Risk",
    likelyUseCase: "Wildfire exposure, claims validation, climate risk intelligence",
    recommendedAction: "Create Salesforce task with summarized behavior and route to insurance SDR",
    routingSuggestion: "Insurance & Risk SDR follow-up within 24 hours",
    reviewFlags: [{ severity: "Low", title: "Existing account check", detail: "Check Salesforce for active opportunity or customer relationship before outreach." }],
    suggestedCampaignIdeas: [
      idea("idea_axa_1", "Wildfire Exposure Intelligence", "Use frequent satellite data to see where wildfire risk and damage are changing.", "Pre-event risk monitoring and post-event claims validation.", ["Email", "SDR Follow-up", "Landing Page"], "Request a demo", 94, "High-confidence core ICP."),
      idea("idea_axa_2", "Claims Monitoring Workflow", "Move from delayed reports to objective visual evidence after major events.", "Claims triage, exposure analysis, and damage monitoring.", ["Email", "Webinar", "SDR Follow-up"], "See the workflow", 88, "Strong follow-up to webinar behavior.")
    ]
  },
  {
    id: "sig_003",
    accountName: "Syngenta",
    accountDomain: "syngenta.com",
    personName: "Elena Fischer",
    personTitle: "Digital Agriculture Product Manager",
    personEmail: "elena.fischer@syngenta.com",
    source: "Salesforce Campaign Member",
    sourceDetail: "Added as campaign member after agriculture monitoring webinar",
    region: "Europe",
    industry: "Agriculture Technology",
    companySize: "10,001+",
    observedBehavior: ["Registered for crop monitoring webinar", "Attended live session", "Clicked follow-up email about near-daily imagery", "Visited agriculture page 5 times in 14 days"],
    behaviorTimeline: timeline([
      ["2026-05-28", "Webinar Registration", "Registered for crop monitoring webinar", 14],
      ["2026-06-01", "Webinar Attend", "Attended 51 minutes", 24],
      ["2026-06-03", "Email Click", "Clicked near-daily imagery follow-up CTA", 16]
    ]),
    intentScore: 89,
    confidence: "Very High",
    status: "Sales Ready",
    likelyVertical: "Agriculture",
    likelyUseCase: "Crop health monitoring, field intelligence, yield risk visibility",
    recommendedAction: "Route to agriculture account team with webinar and page-engagement summary",
    routingSuggestion: "Agriculture SDR + account owner review",
    reviewFlags: [{ severity: "Low", title: "Relationship check", detail: "Check existing partnership/customer context before generating outreach." }],
    suggestedCampaignIdeas: [
      idea("idea_syngenta_1", "Near-Daily Field Intelligence", "See crop change before field issues become yield issues.", "Crop stress, disease risk, harvest planning, and sustainability monitoring.", ["Email", "LinkedIn Paid", "SDR Follow-up"], "Request a demo", 93, "Use agriculture-specific Planet language.")
    ]
  },
  {
    id: "sig_004",
    accountName: "Port of Rotterdam Authority",
    accountDomain: "portofrotterdam.com",
    personName: "Lars Van Dijk",
    personTitle: "Maritime Operations Analyst",
    personEmail: "lars.vandijk@portofrotterdam.com",
    source: "API Docs Visit",
    sourceDetail: "Repeated visits to tasking and data API documentation",
    region: "Europe",
    industry: "Maritime / Port Operations",
    companySize: "1,001-5,000",
    observedBehavior: ["Visited Planet API docs 6 times", "Viewed maritime monitoring content", "Searched site for vessel detection", "Downloaded technical data sheet"],
    behaviorTimeline: timeline([
      ["2026-05-30", "API Docs Visit", "Viewed tasking API documentation", 16],
      ["2026-06-02", "Site Search", "Searched for vessel detection", 18],
      ["2026-06-04", "Download", "Downloaded technical data sheet", 15]
    ]),
    intentScore: 86,
    confidence: "High",
    status: "Ready for Campaign Ideas",
    likelyVertical: "Maritime",
    likelyUseCase: "Maritime domain awareness, port monitoring, vessel activity visibility",
    recommendedAction: "Generate maritime campaign ideas and check technical buyer fit",
    routingSuggestion: "Maritime account team review",
    reviewFlags: [{ severity: "Medium", title: "Technical buyer", detail: "Message should include API/data delivery angle, not only executive value prop." }],
    suggestedCampaignIdeas: [
      idea("idea_rotterdam_1", "Maritime Awareness Beyond AIS", "Use satellite imagery to add visual context to maritime activity.", "Port monitoring, vessel detection, and operational awareness.", ["Email", "SDR Follow-up", "Landing Page"], "Explore maritime workflows", 87, "Include API delivery and monitoring cadence.")
    ]
  },
  {
    id: "sig_005",
    accountName: "California Office of Emergency Services",
    accountDomain: "caloes.ca.gov",
    personName: "Daniel Ruiz",
    personTitle: "Resilience Planning Coordinator",
    personEmail: "daniel.ruiz@caloes.ca.gov",
    source: "SplashThat Event Scan",
    sourceDetail: "Badge scanned at emergency management conference",
    region: "North America",
    industry: "Government / Emergency Management",
    companySize: "Government Agency",
    observedBehavior: ["Badge scan at emergency management event", "Selected wildfire response interest on event form", "Opened post-event email", "Clicked disaster response case study"],
    behaviorTimeline: timeline([
      ["2026-06-01", "Event Scan", "Badge scanned at booth", 18],
      ["2026-06-02", "Form Field", "Selected wildfire response interest", 20],
      ["2026-06-03", "Email Click", "Clicked disaster response case study", 15]
    ]),
    intentScore: 88,
    confidence: "High",
    status: "Sales Ready",
    likelyVertical: "Government & Civil",
    likelyUseCase: "Disaster response, wildfire monitoring, resilience planning",
    recommendedAction: "Create post-event follow-up campaign with government resilience messaging",
    routingSuggestion: "Government/civil SDR with event context",
    reviewFlags: [{ severity: "Medium", title: "Public sector messaging", detail: "Avoid commercial urgency language; focus on public resilience and operational visibility." }],
    suggestedCampaignIdeas: [
      idea("idea_caloes_1", "Disaster Readiness Follow-up", "See changing conditions before, during, and after major events.", "Wildfire monitoring, damage assessment, and recovery planning.", ["Event Follow-up", "Email", "SDR Follow-up"], "Schedule a resilience workflow demo", 90, "Strong event lead with clear stated interest.")
    ]
  },
  ...[
    ["sig_006", "Munich Re", "munichre.com", "Sofia Keller", "Natural Catastrophe Risk Specialist", "6sense Account Intent", "Insurance & Risk", "Natural catastrophe risk, exposure monitoring, climate volatility", 87, "High", "Ready for Campaign Ideas", "Generate account-specific risk campaign and validate contacts in Salesforce", "NatCat Risk Visibility", "Use Earth observation to monitor climate-driven risk at scale.", "Wildfire, flood, and post-event exposure monitoring.", "Request a risk workflow demo"],
    ["sig_007", "Cargill", "cargill.com", "Priya Nair", "Sustainability Analytics Manager", "Content Download", "Agriculture", "Sustainability monitoring, land-use change, supply-chain visibility", 82, "High", "Ready for Campaign Ideas", "Generate agriculture sustainability campaign ideas", "Supply Chain Land-Use Visibility", "Monitor land-use change across sourcing regions with frequent Earth observation data.", "Sustainability, sourcing risk, and environmental monitoring.", "Explore agriculture monitoring"],
    ["sig_008", "Maersk", "maersk.com", "Oliver Jensen", "Global Operations Intelligence Lead", "LinkedIn Paid", "Maritime", "Port monitoring, route disruption awareness, vessel activity visibility", 76, "Medium", "Needs Enrichment", "Enrich contact and check existing account ownership before campaign build", "Port and Route Visibility", "Use satellite imagery to monitor activity and disruption around critical maritime nodes.", "Port congestion context, vessel activity, and operational monitoring.", "Explore maritime monitoring"],
    ["sig_009", "Duke Energy", "duke-energy.com", "Rachel Morgan", "Grid Resilience Program Manager", "Google Ads", "Energy & Infrastructure", "Grid resilience, infrastructure monitoring, storm impact visibility", 80, "High", "Ready for Campaign Ideas", "Generate infrastructure resilience campaign ideas", "Infrastructure Resilience Monitoring", "Monitor changing ground conditions and post-event impact across critical infrastructure areas.", "Storm damage, vegetation encroachment, and grid resilience planning.", "Request an infrastructure workflow demo"],
    ["sig_010", "The Nature Conservancy", "nature.org", "Amelia Brooks", "Conservation Science Director", "Newsletter Engagement", "Environmental & Climate", "Biodiversity monitoring, habitat change, deforestation visibility", 74, "Medium", "Nurture Only", "Keep in environmental nurture; do not route to sales yet", "Habitat Change Monitoring", "Use frequent Earth observation data to monitor environmental change across priority regions.", "Biodiversity, habitat loss, land-use change, and conservation planning.", "Explore environmental monitoring resources"],
    ["sig_011", "Rio Tinto", "riotinto.com", "Marcus Hill", "Remote Operations Manager", "Bombora Intent", "Energy & Infrastructure", "Remote site monitoring, infrastructure change detection, operational visibility", 77, "Medium", "Needs Enrichment", "Enrich contact and generate infrastructure monitoring idea after validation", "Remote Site Change Detection", "Monitor change across distributed assets with frequent satellite imagery.", "Remote operations, site development, environmental conditions, and infrastructure monitoring.", "Explore infrastructure monitoring"],
    ["sig_012", "NASA Earth Science Division", "nasa.gov", "Dr. Hannah Patel", "Research Program Scientist", "Gainsight Community", "Platform / Developer", "Research access, historical imagery, API-enabled analysis", 79, "High", "Ready for Campaign Ideas", "Generate technical education campaign, not hard sales campaign", "Archive-to-Insight Workflow", "Help research teams move from imagery access to repeatable change analysis.", "Historical archive, API workflows, Earth science research.", "Explore technical resources"],
    ["sig_013", "FEMA", "fema.dhs.gov", "Anthony Walker", "Disaster Operations Analyst", "CSV Event Upload", "Government & Civil", "Disaster response, damage assessment, emergency operations", 70, "Medium", "Manual Review", "Clean event lead record before Salesforce sync", "Post-Event Disaster Response Follow-up", "Use satellite imagery to support situational awareness before and after disaster events.", "Damage assessment, response planning, recovery monitoring.", "Schedule a disaster response workflow demo"],
    ["sig_014", "World Bank Climate Group", "worldbank.org", "Leila Haddad", "Climate Resilience Program Lead", "Partner Referral", "Environmental & Climate", "Climate resilience, flood/drought monitoring, public-sector planning", 83, "High", "Ready for Campaign Ideas", "Generate resilience-focused partner follow-up campaign", "Climate Resilience Monitoring", "Use Earth observation to make climate risk visible for resilience planning.", "Flood, drought, land-use change, and infrastructure exposure.", "Explore resilience workflows"],
    ["sig_015", "Bayer Crop Science", "bayer.com", "Matthias Klein", "Digital Farming Strategy Lead", "Website Demo Form", "Agriculture", "Crop monitoring, field intelligence, digital farming workflows", 96, "Very High", "Sales Ready", "Immediate SDR handoff with agriculture context", "Digital Farming Intelligence", "Use near-daily satellite imagery to monitor crop change at field scale.", "Crop health, scouting prioritization, yield risk, and digital farming platform enrichment.", "Schedule agriculture demo"],
    ["sig_016", "Swiss Re", "swissre.com", "Nora Baumann", "Climate Risk Product Lead", "Organic Social", "Insurance & Risk", "Climate risk product intelligence, exposure monitoring, natural catastrophe analysis", 81, "High", "Ready for Campaign Ideas", "Generate insurance risk campaign and verify current Salesforce relationship", "Climate Risk Product Intelligence", "Turn changing physical conditions into earlier risk intelligence.", "Exposure monitoring, NatCat risk, climate analytics products.", "Request a climate-risk demo"],
    ["sig_017", "FarmQA", "farmqa.com", "Tara Miller", "Head of Product Partnerships", "Customer Expansion Signal", "Agriculture", "Partner integration, scouting workflows, field monitoring", 78, "High", "Ready for Campaign Ideas", "Create expansion/partner campaign idea, coordinate with account owner", "Partner Field Intelligence Workflow", "Bring near-daily imagery into scouting and field decision workflows.", "Ag platform integration, field scouting, crop condition monitoring.", "Explore expanded workflows"],
    ["sig_018", "NOAA Coastal Services", "noaa.gov", "Emily Torres", "Coastal Resilience Analyst", "Product Freemium App", "Government & Civil", "Coastal resilience, flood monitoring, recurring data workflows", 92, "Very High", "Sales Ready", "Create Salesforce task with summarized product behavior and suggested government resilience workflow", "Coastal Resilience Data Feed", "Move from one-off analysis to recurring visibility into coastal change.", "Flood exposure, storm impact, recovery monitoring, and recurring data delivery.", "Explore recurring data workflows"],
    ["sig_019", "U.S. Forest Service", "usda.gov", "Kevin Hartley", "Forest Health Program Analyst", "Content Download", "Environmental & Climate", "Forest health, wildfire risk, vegetation monitoring, land-change detection", 85, "High", "Ready for Campaign Ideas", "Generate forestry resilience campaign and keep public-sector tone", "Forest Change Monitoring", "Use frequent satellite imagery to monitor vegetation change and wildfire-prone areas.", "Forest health, wildfire risk, vegetation stress, and land-change monitoring.", "Explore forest monitoring workflows"],
    ["sig_020", "Esri", "esri.com", "Jason Kim", "Partner Solutions Architect", "API Docs Visit", "Platform / Developer", "GIS integration, developer workflows, imagery APIs, partner ecosystem", 88, "High", "Ready for Campaign Ideas", "Generate technical partner campaign and coordinate with partner team", "Imagery API Integration Workflow", "Bring frequent Earth observation data into GIS and developer workflows.", "API access, platform integration, GIS workflows, partner ecosystem.", "Explore API workflows"],
    ["sig_021", "Mahindra Agri Solutions", "mahindra.com", "Aarav Mehta", "Digital Agriculture Business Lead", "Organic Social", "Agriculture", "Crop maturity monitoring, harvest planning, agricultural operations", 79, "High", "Ready for Campaign Ideas", "Generate agriculture campaign around maturity-based harvest planning", "Harvest Timing Intelligence", "Move from calendar-based decisions to visibility into changing crop conditions.", "Crop maturity, harvest timing, operational planning, and sustainable resource use.", "Explore agriculture workflows"],
    ["sig_022", "Black & Veatch", "bv.com", "Meghan Carter", "Infrastructure Advisory Director", "SDR Note", "Energy & Infrastructure", "Infrastructure resilience, utility planning, climate exposure monitoring", 73, "Medium", "Manual Review", "Map SDR note to campaign/contact record before campaign follow-up", "Infrastructure Climate Exposure", "Use Earth observation to support resilience planning around infrastructure assets.", "Flood, wildfire, land-change, and utility exposure monitoring.", "See infrastructure resilience workflow"],
    ["sig_023", "Stanford Natural Capital Project", "stanford.edu", "Dr. Isabel Romero", "Geospatial Research Lead", "Product Freemium App", "Environmental & Climate", "Biodiversity monitoring, land-use change, research workflows", 82, "High", "Ready for Campaign Ideas", "Route to research/education nurture or partner workflow, not enterprise SDR by default", "Research Workflow Enablement", "Help researchers turn Earth observation data into repeatable environmental analysis.", "Biodiversity, land-use change, habitat monitoring, API workflows.", "Explore research workflows"],
    ["sig_024", "State Farm", "statefarm.com", "Chris Anderson", "Property Risk Innovation Manager", "Website Demo Form", "Insurance & Risk", "Property risk, wildfire exposure, claims triage, climate risk monitoring", 97, "Very High", "Sales Ready", "Immediate SDR handoff and campaign member attribution check", "Property Risk Visibility", "Use objective visual evidence to monitor changing risk around exposed properties.", "Wildfire exposure, post-event triage, climate risk intelligence.", "Schedule a risk workflow demo"]
  ].map(
    ([
      id,
      accountName,
      accountDomain,
      personName,
      personTitle,
      source,
      likelyVertical,
      likelyUseCase,
      intentScore,
      confidence,
      status,
      recommendedAction,
      ideaName,
      theme,
      useCase,
      cta
    ]) =>
      ({
        id,
        accountName,
        accountDomain,
        personName,
        personTitle,
        personEmail: `${String(personName).toLowerCase().replace(/[^a-z]+/g, ".").replace(/\.$/, "")}@${accountDomain}`,
        source,
        sourceDetail: `${source} signal structured as mock integration data`,
        region: String(accountDomain).endsWith(".gov") ? "North America" : "Global",
        industry: String(likelyVertical),
        companySize: String(accountName).includes("FarmQA") ? "51-200" : "10,001+",
        observedBehavior: [
          `Observed ${String(source).toLowerCase()} engagement tied to ${String(likelyUseCase).toLowerCase()}`,
          "Viewed Planet content or workflow context related to the likely use case",
          "No real integration is connected; this is demo-only mock signal data"
        ],
        behaviorTimeline: timeline([
          ["2026-06-01", String(source), `Initial ${String(source).toLowerCase()} signal captured`, 14],
          ["2026-06-03", "Use Case Engagement", `Engaged with ${String(likelyUseCase).split(",")[0]} context`, 16],
          ["2026-06-04", "Routing Check", `Recommended action: ${String(recommendedAction)}`, String(status) === "Manual Review" ? -8 : 10]
        ]),
        intentScore,
        confidence,
        status,
        likelyVertical,
        likelyUseCase,
        recommendedAction,
        routingSuggestion: String(status) === "Sales Ready" ? "SDR handoff with behavior summary" : String(status) === "Manual Review" ? "Marketing Ops review before routing" : "Growth marketing review",
        reviewFlags: [
          {
            severity: String(status) === "Manual Review" ? "High" : "Medium",
            title: String(status) === "Manual Review" ? "Attribution or data-quality review" : "Human review before outreach",
            detail: String(status) === "Sales Ready" ? "Confirm owner and preserve attribution before follow-up." : "Use signal context carefully and do not overstate fit."
          }
        ],
        suggestedCampaignIdeas: [
          idea(`idea_${String(id).replace("sig_", "")}_1`, String(ideaName), String(theme), String(useCase), defaultChannels(String(source)), String(cta), Math.min(96, Number(intentScore) + 4), "Generated from mock signal context; human review required.")
        ]
      }) as LeadSignal
  )
];

function defaultChannels(source: string) {
  if (source.includes("Product")) return ["Email", "SDR Follow-up", "Landing Page"];
  if (source.includes("Event") || source.includes("CSV")) return ["Event Follow-up", "Email", "SDR Follow-up"];
  if (source.includes("Google")) return ["Paid Search", "Landing Page", "SDR Follow-up"];
  if (source.includes("Webinar")) return ["Webinar", "Email", "SDR Follow-up"];
  if (source.includes("LinkedIn") || source.includes("Organic")) return ["LinkedIn Paid", "Email", "Landing Page"];
  return ["Email", "LinkedIn Paid", "SDR Follow-up"];
}

export function getSignalById(id: string) {
  return leadSignals.find((signal) => signal.id === id);
}

export function getSignalIdea(signal: LeadSignal, ideaId?: string) {
  return signal.suggestedCampaignIdeas.find((campaignIdea) => campaignIdea.id === ideaId) ?? signal.suggestedCampaignIdeas[0];
}

const supportedChannels = new Set<CampaignBuilderChannel>([
  "Email",
  "LinkedIn Paid",
  "SDR Follow-up",
  "Landing Page",
  "Webinar",
  "Event Follow-up",
  "Organic Social",
  "Paid Search"
]);

export function toBuilderChannels(channels: string[]): CampaignBuilderChannel[] {
  const normalized = channels
    .map((channel) => {
      if (channel.includes("LinkedIn")) return "LinkedIn Paid";
      if (channel.includes("SDR") || channel.includes("Account Owner") || channel.includes("Partner Outreach")) return "SDR Follow-up";
      if (channel.includes("Landing")) return "Landing Page";
      if (channel.includes("Event")) return "Event Follow-up";
      if (channel.includes("Webinar")) return "Webinar";
      if (channel.includes("Search")) return "Paid Search";
      if (channel.includes("Social")) return "Organic Social";
      return "Email";
    })
    .filter((channel): channel is CampaignBuilderChannel => supportedChannels.has(channel as CampaignBuilderChannel));

  return Array.from(new Set(normalized.length ? normalized : ["Email", "LinkedIn Paid", "SDR Follow-up"]));
}

export function buildCampaignInputFromSignal(signal: LeadSignal, ideaId?: string): CampaignBuilderInput {
  const selectedIdea = getSignalIdea(signal, ideaId);
  return {
    campaignIdea: selectedIdea.name,
    targetVertical: signal.likelyVertical,
    targetAudience: `${signal.personTitle} and adjacent stakeholders at ${signal.accountName}; ${signal.likelyUseCase}`,
    campaignGoal: signal.status === "Sales Ready" ? "Generate qualified demo requests" : "Progress reviewed campaign interest",
    primaryCTA: selectedIdea.cta,
    landingPageUrl: signal.likelyVertical.includes("Agriculture")
      ? "https://www.planet.com/solutions/agriculture"
      : signal.likelyVertical.includes("Maritime")
        ? "https://www.planet.com/solutions/maritime"
        : "https://www.planet.com/solutions/climate-risk",
    region: signal.region,
    channels: toBuilderChannels(selectedIdea.bestChannels),
    lifecycleStage: signal.status === "Sales Ready" ? "Conversion" : "Consideration",
    campaignOwner: "Growth Marketing",
    salesMotion: signal.status === "Sales Ready" ? "ABM" : "inbound",
    notes: `Signal source: ${signal.source}. ${signal.sourceDetail}. Review note: ${selectedIdea.reviewNote}. This is mock demo data, not a live Salesforce or Marketo record.`
  };
}
