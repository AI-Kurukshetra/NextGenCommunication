import Link from "next/link";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { footerColumns } from "@/content/marketing";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#58d7c4]">Stay close to the platform</p>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
            Product releases, operator insights, and launch planning notes.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Follow the public platform roadmap, architecture guides, and carrier operations notes from the team building
            NextGen Cloud Communications.
          </p>
          <NewsletterForm />
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{column.title}</p>
              <div className="space-y-2">
                {column.links.map((link) => (
                  <Link key={link.label} href={link.href} className="block text-sm text-slate-200 transition-colors hover:text-[#58d7c4]">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>NextGen Cloud Communications. Original product-marketing implementation for enterprise CPaaS workflows.</p>
          <p>Built with Next.js, Supabase, and a multi-tenant communications control plane.</p>
        </div>
      </div>
    </footer>
  );
}
