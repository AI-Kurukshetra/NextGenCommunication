import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { CodeWindow } from "@/components/marketing/code-window";
import { LeadForm } from "@/components/marketing/lead-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  coverageStats,
  customerStories,
  heroMetrics,
  logoCloud,
  platformCards,
  platformHighlights,
  resourceCards,
  solutionCards
} from "@/content/marketing";

export default function MarketingHomePage() {
  const marqueeLogos = [...logoCloud, ...logoCloud];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-black/5 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.18),transparent_44%),radial-gradient(circle_at_100%_10%,rgba(15,23,42,0.12),transparent_52%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Build operator-grade communications
            </p>
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-6xl">
                Communications infrastructure that feels like cloud software, not telecom plumbing.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Replace fragmented CPaaS tooling with one programmable platform for messaging, voice, identity,
                routing, analytics, workflows, and AI-assisted customer operations.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing#trial">
                <Button className="h-12 rounded-full bg-slate-950 px-7 text-white hover:bg-slate-800">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="secondary"
                  className="h-12 rounded-full border border-slate-300 bg-white px-7 text-slate-950"
                >
                  Talk to an architect
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-2xl font-semibold text-slate-950">{metric.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
          <CodeWindow />
        </div>
      </section>

      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Trusted by operating teams at</p>
          <div className="relative mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white via-white/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white via-white/80 to-transparent" />
            <div className="logo-marquee-track">
              {marqueeLogos.map((logo, index) => (
                <div
                  key={`${logo.name}-${index}`}
                  className="logo-float flex min-w-[240px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  style={{ animationDelay: `${(index % logoCloud.length) * 0.25}s` }}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: logo.accent }}
                  >
                    {logo.monogram}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{logo.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Customer</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Platform"
          title="Everything needed to launch and operate communications at enterprise scale."
          description="A product surface modeled around engineering teams and operator workflows, not disconnected feature add-ons."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {platformCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="h-full rounded-[24px] border-slate-200 bg-white p-6 transition-transform hover:-translate-y-1 hover:shadow-xl">
                <CardTitle className="text-2xl">{card.title}</CardTitle>
                <CardDescription className="mt-3 leading-7">{card.description}</CardDescription>
                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  {card.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-black/5 bg-[#e7ecef]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 lg:grid-cols-2 lg:px-8">
          {platformHighlights.map((item) => (
            <Card key={item.title} className="rounded-[28px] border-slate-200 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f766e]">{item.eyebrow}</p>
              <CardTitle className="mt-3 text-3xl leading-tight">{item.title}</CardTitle>
              <CardDescription className="mt-4 text-base leading-8">{item.copy}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Solutions"
          title="Purpose-built for teams running support, lifecycle messaging, and critical communications."
          description="Use-case templates and policy controls keep product delivery velocity high while maintaining operational discipline."
          align="center"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {solutionCards.map((solution) => (
            <Card key={solution.title} className="rounded-[24px] border-slate-200 bg-white p-6">
              <CardTitle className="text-2xl">{solution.title}</CardTitle>
              <CardDescription className="mt-2 text-base leading-8">{solution.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 lg:grid-cols-2 lg:px-8">
          {customerStories.map((story) => (
            <Card key={story.company} className="rounded-[28px] border-slate-200 bg-slate-50 p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{story.company}</p>
              <CardTitle className="mt-3 text-3xl leading-tight">{story.title}</CardTitle>
              <CardDescription className="mt-3 text-base leading-8">{story.copy}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Coverage and Routing"
          title="Carrier-aware routing across priority markets."
          description="Design resilient traffic paths and regional launch strategies with operator-facing telemetry and fallback controls."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {coverageStats.map((stat) => (
            <Card key={stat.label} className="rounded-[24px] border-slate-200 bg-white p-6">
              <CardTitle className="text-4xl">{stat.value}</CardTitle>
              <CardDescription className="mt-2 text-base leading-7">{stat.label}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-black/5 bg-[#f4faf9]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Resources"
            title="Support launch planning with docs, coverage intelligence, and architecture sessions."
            align="center"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {resourceCards.map((resource) => (
              <Link key={resource.title} href={resource.href}>
                <Card className="h-full rounded-[24px] border-slate-200 bg-white p-6">
                  <CardTitle className="text-2xl">{resource.title}</CardTitle>
                  <CardDescription className="mt-3 text-base leading-7">{resource.description}</CardDescription>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-[#58d7c4]" />
              Implementation
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Start with architect-led onboarding and move to production with confidence.
            </h2>
            <p className="text-base leading-8 text-slate-600 md:text-lg">
              We map your current provider stack, define migration phases, and configure routing, webhooks, analytics,
              and compliance controls before go-live.
            </p>
            <div className="grid gap-3 text-sm text-slate-700">
              <p className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-emerald-600" />
                Migration and rollout plan aligned to your channel mix.
              </p>
              <p className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-emerald-600" />
                Dedicated support for webhook, SDK, and dashboard integration.
              </p>
            </div>
          </div>
          <LeadForm variant="expert" />
        </div>
      </section>
    </div>
  );
}
