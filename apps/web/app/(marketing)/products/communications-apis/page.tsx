import { CheckCircle2 } from "lucide-react";

import { LeadForm } from "@/components/marketing/lead-form";
import { SectionHeading } from "@/components/marketing/section-heading";

const features = [
  "Programmable SMS, MMS, and voice APIs",
  "Delivery receipts and call events via webhooks",
  "Phone number lifecycle: purchase, porting, assignment",
  "2FA verification and OTP rate controls",
  "Tenant-level auth, usage tracking, and billing instrumentation"
];

export default function CommunicationsApisPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Communications APIs"
          title="Ship messaging and voice capabilities from one extensible API platform."
          description="Launch fast with composable APIs, then scale with usage controls, observability, and webhook-driven workflows."
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
      <LeadForm variant="trial" />
    </div>
  );
}
