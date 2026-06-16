import Link from "next/link";

const workflowSteps = [
  {
    step: "01",
    title: "Review Signals",
    description: "Identify accounts showing meaningful activity."
  },
  {
    step: "02",
    title: "Understand the Account",
    description: "Review intent, account fit, supporting evidence, and possible risks."
  },
  {
    step: "03",
    title: "Choose a Campaign Idea",
    description: "Compare, edit, or regenerate possible campaign directions."
  },
  {
    step: "04",
    title: "Build the Campaign",
    description: "Prepare campaign assets and recommended next actions."
  },
  {
    step: "05",
    title: "Measure Results",
    description: "Review simulated campaign and funnel performance."
  }
];

export default function LandingPage() {
  return (
    <main className="landingPage">
      <nav className="landingNav" aria-label="Landing page navigation">
        <Link className="landingBrand" href="/">GTM Intelligence Studio</Link>
        <div>
          <a href="#how-it-works">How It Works</a>
          <a href="#demo-data">Demo Data</a>
          <Link className="navCta" href="/signals">Launch Workspace</Link>
        </div>
      </nav>

      <section className="landingHero">
        <div className="landingHeroInner">
          <p className="eyebrow">AI-Assisted GTM Workflow</p>
          <h1>Turn GTM signals into coordinated action.</h1>
          <p className="landingLead">
            GTM Intelligence Studio is an AI-assisted demonstration that shows how account signals
            can move through research, intent analysis, campaign planning, asset creation,
            ownership, and performance measurement.
          </p>
          <p className="landingSupport">
            The workflow helps users review account activity, understand intent, compare campaign
            ideas, prepare channel-specific assets, and track simulated outcomes.
          </p>
          <div className="landingActions">
            <Link className="primaryAction" href="/signals">Explore the Demo Workflow</Link>
            <a className="secondaryAction" href="#how-it-works">See How It Works</a>
          </div>
        </div>
      </section>

      <section className="landingSection landingDisclaimerSection" id="demo-data">
        <article className="disclaimerCard">
          <p className="eyebrow">Demo Data Disclaimer</p>
          <h2>Demo Data Disclaimer</h2>
          <p>
            This application is a demonstration built entirely with fictional companies, mock account
            signals, sample campaign content, and simulated performance metrics.
          </p>
          <p>
            No data shown in this application was obtained from, provided by, or sourced from any
            company, employer, customer, CRM, marketing platform, or private database. All examples
            were independently created solely to demonstrate the workflow.
          </p>
          <p>
            The application is not connected to any live systems and does not represent the actual
            data, customers, campaigns, strategy, business activity, or internal operations of any
            organization.
          </p>
        </article>
      </section>

      <section className="landingSection" id="how-it-works">
        <div className="sectionIntro">
          <p className="eyebrow">How it works</p>
          <h2>How the demo workflow works.</h2>
          <p>
            Follow a fictional account signal from initial review through campaign planning, asset
            preparation, and simulated reporting.
          </p>
        </div>
        <div className="workflowCards">
          {workflowSteps.map((item) => (
            <article key={item.step} className="workflowStepCard">
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
