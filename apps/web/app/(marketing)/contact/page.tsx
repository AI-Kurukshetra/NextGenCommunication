import { Mail, MessageSquare, PhoneCall } from "lucide-react";

import { LeadForm } from "@/components/marketing/lead-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const contacts = [
  {
    title: "Sales",
    description: "Enterprise deployment planning, pricing, and migration timelines.",
    icon: PhoneCall
  },
  {
    title: "Solutions",
    description: "Architecture reviews, compliance planning, and routing validation.",
    icon: MessageSquare
  },
  {
    title: "Support",
    description: "Existing customer escalations and operations questions.",
    icon: Mail
  }
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Contact"
        title="Engage our operators and solutions team."
        description="We respond quickly and align with your rollout timeline, compliance requirements, and service expectations."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-5">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <Card key={contact.title} className="rounded-[24px] border-slate-200 bg-white p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3">
                  <Icon className="h-5 w-5 text-slate-900" />
                </div>
                <CardTitle className="text-2xl">{contact.title}</CardTitle>
                <CardDescription className="mt-2 text-base leading-7">{contact.description}</CardDescription>
              </Card>
            );
          })}
        </div>
        <LeadForm variant="expert" />
      </div>
    </div>
  );
}
