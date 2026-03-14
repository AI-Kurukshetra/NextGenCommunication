import Link from "next/link";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { platformCards } from "@/content/marketing";

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Products"
        title="A unified product surface for modern communications operations."
        description="Build with APIs. Operate with visibility. Scale with routing and automation controls designed for enterprise teams."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {platformCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="h-full rounded-[24px] border-slate-200 bg-white p-6 transition-transform hover:-translate-y-1">
              <CardTitle className="text-2xl">{card.title}</CardTitle>
              <CardDescription className="mt-3 text-base leading-7">{card.description}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
