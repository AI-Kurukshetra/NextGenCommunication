import { CheckCircle2 } from "lucide-react";

import { LeadForm } from "@/components/marketing/lead-form";
import { SectionHeading } from "@/components/marketing/section-heading";

const features = [
  "AI spam and fraud scoring before dispatch",
  "Intent-aware routing between channels and agents",
  "Workflow builder for event-driven automation",
  "Omnichannel message normalization",
  "Policy guardrails and auditable AI operations"
];

export default function AiPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="AI Orchestration"
          title="Route, automate, and govern AI-assisted communications at platform level."
          description="Bring model-driven interactions into your existing voice and messaging systems without losing operator control."
        />
        <ul className="space-y-3 text-sm text-slate-700">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <LeadForm variant="expert" />
    </div>
  );
}
