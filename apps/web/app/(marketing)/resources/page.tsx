import type { Route } from "next";
import { ArrowRight, BookOpen, Boxes, FileCheck2, FileText, Plug } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const resources: Array<{
  title: string;
  icon: typeof BookOpen;
  description: string;
  href: Route;
}> = [
  {
    title: "Developer Docs",
    icon: BookOpen,
    description: "API reference, SDK guides, webhook patterns, and integration checklists.",
    href: "/developer-portal"
  },
  {
    title: "Migration Kits",
    icon: Boxes,
    description: "Playbooks for moving off legacy CPaaS providers without service disruption.",
    href: "/contact"
  },
  {
    title: "Compliance Briefs",
    icon: FileCheck2,
    description: "Templates for consent capture, opt-out flows, and regional compliance readiness.",
    href: "/resources"
  },
  {
    title: "Solution Templates",
    icon: FileText,
    description: "Working reference architectures for verification, support, and marketing flows.",
    href: "/solutions"
  },
  {
    title: "Integration Hub",
    icon: Plug,
    description: "Reusable patterns for CRM, ticketing, and analytics integrations.",
    href: "/resources"
  }
];

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Resources"
        title="Everything needed to design, build, and operate your communications stack."
        description="Architecture guidance, implementation kits, and enablement resources for modern CPaaS teams."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <Link key={resource.title} href={resource.href}>
              <Card className="h-full rounded-[24px] border-slate-200 bg-white p-6 transition-transform hover:-translate-y-1">
                <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3">
                  <Icon className="h-5 w-5 text-slate-900" />
                </div>
                <CardTitle className="text-2xl">{resource.title}</CardTitle>
                <CardDescription className="mt-2 text-base leading-7">{resource.description}</CardDescription>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  Explore
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
