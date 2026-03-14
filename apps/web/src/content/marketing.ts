import type { Route } from "next";

export interface MarketingLink {
  label: string;
  href: Route;
  description: string;
}

export interface MarketingNavItem {
  label: string;
  href: Route;
  sections: Array<{
    title: string;
    links: MarketingLink[];
  }>;
}

export const marketingNav: MarketingNavItem[] = [
  {
    label: "Products",
    href: "/products",
    sections: [
      {
        title: "Platform",
        links: [
          {
            label: "Communications APIs",
            href: "/products/communications-apis",
            description: "Voice, messaging, numbers, webhooks, and identity APIs in one control plane."
          },
          {
            label: "AI Orchestration",
            href: "/products/ai",
            description: "Routing, policy controls, and guardrails for agentic customer communications."
          },
          {
            label: "Operator Insights",
            href: "/products/insights",
            description: "Realtime analytics, fraud scoring, deliverability, and carrier performance telemetry."
          }
        ]
      },
      {
        title: "Buyer Paths",
        links: [
          {
            label: "Global Coverage",
            href: "/coverage",
            description: "Carrier strategy, fallback routing, and regional launch planning."
          },
          {
            label: "Pricing",
            href: "/pricing",
            description: "Usage-based commercial model with reserved throughput options."
          }
        ]
      }
    ]
  },
  {
    label: "Solutions",
    href: "/solutions",
    sections: [
      {
        title: "Use Cases",
        links: [
          {
            label: "Customer Support",
            href: "/solutions",
            description: "Omnichannel support flows with AI assist, routing, and compliant recordings."
          },
          {
            label: "Growth Messaging",
            href: "/solutions",
            description: "Transactional alerts, lifecycle campaigns, and developer-first experimentation."
          },
          {
            label: "Modern Voice",
            href: "/solutions",
            description: "Programmable voice, SIP trunking, and workforce telephony modernization."
          }
        ]
      }
    ]
  },
  {
    label: "Resources",
    href: "/resources",
    sections: [
      {
        title: "Build",
        links: [
          {
            label: "Developer Resources",
            href: "/resources",
            description: "SDKs, API guides, webhook examples, and reference architectures."
          },
          {
            label: "Pricing Guide",
            href: "/pricing",
            description: "How to estimate spend, commitments, and throughput strategy."
          }
        ]
      },
      {
        title: "Plan",
        links: [
          {
            label: "Coverage Matrix",
            href: "/coverage",
            description: "Regional reach, channel availability, and rollout assumptions."
          },
          {
            label: "Talk To An Architect",
            href: "/contact",
            description: "Get migration guidance for enterprise communications platforms."
          }
        ]
      }
    ]
  }
];

export const logoCloud = [
  "Northstar Health",
  "Axiom Travel",
  "Lattice Bank",
  "Helio Insurance",
  "Summit Retail",
  "Pulse Transit"
];

export const heroMetrics = [
  { value: "99.99%", label: "platform availability target" },
  { value: "<85ms", label: "median API latency in-region" },
  { value: "60+", label: "launch-ready routing markets" },
  { value: "24x7", label: "carrier and incident command coverage" }
];

export const platformCards = [
  {
    title: "Communications APIs",
    href: "/products/communications-apis" as Route,
    description: "Launch SMS, MMS, voice, verification, and phone number management from one platform surface.",
    bullets: ["Programmable messaging and voice", "Webhook and event delivery", "Global number lifecycle management"]
  },
  {
    title: "AI Orchestration",
    href: "/products/ai" as Route,
    description: "Coordinate AI agents, human escalation, policy guardrails, and fraud controls for every conversation.",
    bullets: ["Intent-aware routing", "Spam and fraud scoring", "Workflow builder for conversation automation"]
  },
  {
    title: "Operator Insights",
    href: "/products/insights" as Route,
    description: "See traffic quality, segment economics, carrier behavior, and usage rollups in realtime.",
    bullets: ["Carrier health and fallback visibility", "Usage and margin instrumentation", "Audit-ready logs and traces"]
  }
];

export const platformHighlights = [
  {
    eyebrow: "Execution Fabric",
    title: "Ship one communications architecture instead of a stack of tactical vendors.",
    copy:
      "NextGen combines programmable channels, AI control planes, carrier routing, verification, usage analytics, and workflow automation so engineering teams do not rebuild telecom infrastructure every quarter."
  },
  {
    eyebrow: "Operator Controls",
    title: "Protect deliverability, trust, and routing quality by default.",
    copy:
      "Realtime eventing, fraud scoring, and route health make it possible to move traffic before incidents become customer-facing outages."
  }
];

export const solutionCards = [
  {
    title: "Support Operations",
    description: "Voice, SMS, and AI assistants with human handoff, recordings, transcripts, and queue-aware routing."
  },
  {
    title: "Growth and Lifecycle",
    description: "Promotions, alerts, and triggered campaigns with segmentation, templates, and throughput controls."
  },
  {
    title: "Identity and Risk",
    description: "Verification, rate limits, fraud scoring, and suspicious-traffic controls across messaging and voice."
  },
  {
    title: "Enterprise Migration",
    description: "Replace fragmented telecom providers with a single operator model, SDKs, and observability surface."
  }
];

export const customerStories = [
  {
    company: "Northstar Health",
    title: "Centralized patient outreach without carrier drift.",
    copy:
      "Northstar consolidated reminders, virtual care routing, and contact-center voice into one programmable fabric with auditable message and call trails."
  },
  {
    company: "Axiom Travel",
    title: "Scaled incident messaging across regional markets.",
    copy:
      "Axiom moved disruption alerts and support voice overflow into a single platform with policy-based failover and live routing visibility."
  }
];

export const coverageStats = [
  { value: "180+", label: "carrier routes modeled across messaging and voice" },
  { value: "6", label: "regional control zones for latency-sensitive traffic" },
  { value: "3x", label: "routing paths available for critical notification workloads" }
];

export const resourceCards = [
  {
    title: "SDKs and Guides",
    description: "Node SDK, API guides, webhook examples, and migration recipes for Twilio-style workloads.",
    href: "/resources" as Route
  },
  {
    title: "Launch Planning",
    description: "Coverage readiness, commercial assumptions, and traffic planning for new geographies.",
    href: "/coverage" as Route
  },
  {
    title: "Architecture Sessions",
    description: "Work directly with solution architects on migration, compliance, and channel strategy.",
    href: "/contact" as Route
  }
];

export const pricingTiers = [
  {
    name: "Build",
    price: "Usage-based",
    description: "For new products validating messaging, verification, and programmable voice flows.",
    bullets: ["Self-serve API access", "Default routing and webhooks", "Email support during business hours"]
  },
  {
    name: "Scale",
    price: "Committed usage",
    description: "For teams with predictable throughput and growing operational requirements.",
    bullets: ["Reserved throughput and custom limits", "Priority support and migration planning", "Usage analytics and campaign tooling"]
  },
  {
    name: "Operate",
    price: "Custom contract",
    description: "For enterprises replacing core telecom infrastructure and requiring commercial flexibility.",
    bullets: ["Architect-led onboarding", "Carrier strategy and regional rollout planning", "Security, procurement, and SLA alignment"]
  }
];

export const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Products", href: "/products" as Route },
      { label: "Solutions", href: "/solutions" as Route },
      { label: "Coverage", href: "/coverage" as Route },
      { label: "Pricing", href: "/pricing" as Route }
    ]
  },
  {
    title: "Build",
    links: [
      { label: "Resources", href: "/resources" as Route },
      { label: "Developer Portal", href: "/developer-portal" as Route },
      { label: "Dashboard", href: "/dashboard" as Route },
      { label: "Sign In", href: "/login" as Route }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" as Route },
      { label: "Analytics", href: "/analytics" as Route },
      { label: "Webhooks", href: "/webhooks" as Route },
      { label: "API Keys", href: "/api-keys" as Route }
    ]
  }
];
