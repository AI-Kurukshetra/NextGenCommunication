import { BarChart3, Gauge, ShieldCheck, Timer } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const cards = [
  {
    icon: Gauge,
    title: "Traffic Health",
    description: "Monitor queue latency, webhook success, route quality, and throughput pressure in realtime."
  },
  {
    icon: BarChart3,
    title: "Usage Economics",
    description: "Track segment costs, call durations, and campaign spend at org and application granularity."
  },
  {
    icon: ShieldCheck,
    title: "Risk Signals",
    description: "Capture fraud, spam, and anomaly events before they impact customer-facing traffic."
  },
  {
    icon: Timer,
    title: "Delivery Timelines",
    description: "Correlate carrier behavior and delivery speed to tune routing policies with confidence."
  }
];

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Operator Insights"
        title="Observe every message, call, and webhook as a controllable system."
        description="Instrumentation and analytics built for communications operators, not vanity dashboards."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="rounded-[24px] border-slate-200 bg-white p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3">
                <Icon className="h-5 w-5 text-slate-900" />
              </div>
              <CardTitle className="text-2xl">{card.title}</CardTitle>
              <CardDescription className="mt-2 text-base leading-7">{card.description}</CardDescription>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
