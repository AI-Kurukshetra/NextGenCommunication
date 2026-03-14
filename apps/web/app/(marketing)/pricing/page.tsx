import { CheckCircle2 } from "lucide-react";

import { LeadForm } from "@/components/marketing/lead-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { pricingTiers } from "@/content/marketing";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8" id="trial">
      <SectionHeading
        eyebrow="Pricing"
        title="Commercial flexibility for teams scaling global communications."
        description="Start on usage-based pricing, then align commitments and throughput with your operational roadmap."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {pricingTiers.map((tier) => (
          <Card key={tier.name} className="rounded-[24px] border-slate-200 bg-white p-6">
            <CardTitle className="text-2xl">{tier.name}</CardTitle>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{tier.price}</p>
            <CardDescription className="mt-3 text-base leading-7">{tier.description}</CardDescription>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              {tier.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Guided Trial"
            title="Validate performance before you commit." 
            description="We set up a pilot environment, routing plan, and a usage report so you can validate quality, cost, and delivery outcomes."
          />
        </div>
        <LeadForm variant="trial" />
      </div>
    </div>
  );
}
