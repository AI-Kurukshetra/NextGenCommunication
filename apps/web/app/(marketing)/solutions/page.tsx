import { CheckCircle2, Globe, Headphones, LineChart, Shield, Zap } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const solutions = [
  {
    title: "Customer Support",
    icon: Headphones,
    description: "AI-assisted support routing, voice escalation, and compliance-ready recordings at scale."
  },
  {
    title: "Lifecycle Messaging",
    icon: Zap,
    description: "Critical alerts, transactional updates, and lifecycle campaigns with throughput control."
  },
  {
    title: "Global Operations",
    icon: Globe,
    description: "Multi-region deployment with carrier routing and coverage intelligence across priority markets."
  },
  {
    title: "Identity & Trust",
    icon: Shield,
    description: "Verification, OTP rate limits, fraud scoring, and opt-out workflows across channels."
  },
  {
    title: "Revenue Intelligence",
    icon: LineChart,
    description: "Usage attribution, segment economics, and margin insights for every communication workload."
  }
];

const outcomes = [
  "Reduce vendor sprawl by consolidating channels and routing on one control plane.",
  "Improve deliverability with dynamic carrier routing and realtime quality telemetry.",
  "Launch new geographies faster with reusable compliance and operations patterns."
];

export default function SolutionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Solutions"
        title="Solutions engineered for operators, not just developers."
        description="Use-case blueprints and operator tooling allow fast delivery without sacrificing deliverability or compliance."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {solutions.map((solution) => {
          const Icon = solution.icon;
          return (
            <Card key={solution.title} className="rounded-[24px] border-slate-200 bg-white p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3">
                <Icon className="h-5 w-5 text-slate-900" />
              </div>
              <CardTitle className="text-2xl">{solution.title}</CardTitle>
              <CardDescription className="mt-2 text-base leading-7">{solution.description}</CardDescription>
            </Card>
          );
        })}
      </div>
      <div className="mt-12 grid gap-3">
        {outcomes.map((outcome) => (
          <div key={outcome} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
            <span>{outcome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
