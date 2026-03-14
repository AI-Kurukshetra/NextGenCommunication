"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { marketingNav } from "@/content/marketing";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f5f1e9]/90 backdrop-blur-xl">
      <div className="border-b border-black/5 bg-[#0f172a] text-[11px] uppercase tracking-[0.24em] text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
          <p>Operator-grade CPaaS infrastructure for messaging, voice, AI, and orchestration.</p>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/resources" className="transition-colors hover:text-white">
              Docs
            </Link>
            <Link href="/contact" className="transition-colors hover:text-white">
              Support
            </Link>
            <Link href="/login" className="transition-colors hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
            NG
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">NextGen</p>
            <p className="text-lg font-semibold text-slate-950">Cloud Communications</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 xl:flex" onMouseLeave={() => setOpenMenu(null)}>
          {marketingNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onFocus={() => setOpenMenu(item.label)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active || openMenu === item.label ? "bg-white text-slate-950" : "text-slate-600 hover:text-slate-950"
                  )}
                >
                  {item.label}
                </button>
                {openMenu === item.label ? (
                  <div className="absolute left-1/2 top-full mt-4 w-[700px] -translate-x-1/2 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgba(15,23,42,0.14)]">
                    <div className="grid grid-cols-2 gap-6">
                      {item.sections.map((section) => (
                        <div key={section.title} className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                            {section.title}
                          </p>
                          <div className="space-y-2">
                            {section.links.map((link) => (
                              <Link
                                key={link.label}
                                href={link.href}
                                className="block rounded-2xl border border-transparent px-4 py-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
                              >
                                <p className="text-sm font-semibold text-slate-950">{link.label}</p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">{link.description}</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 xl:flex">
          <Link href="/contact">
            <Button variant="secondary" className="rounded-full border border-slate-300 bg-transparent px-5">
              Talk to an expert
            </Button>
          </Link>
          <a href="/pricing#trial">
            <Button className="rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800">Start free trial</Button>
          </a>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white xl:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen ? (
        <div className="border-t border-black/5 bg-white xl:hidden">
          <div className="mx-auto max-w-7xl space-y-4 px-6 py-6">
            {marketingNav.map((item) => (
              <div key={item.label} className="space-y-3 rounded-3xl border border-slate-200 p-4">
                <Link href={item.href} className="text-base font-semibold text-slate-950" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
                {item.sections.map((section) => (
                  <div key={section.title} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{section.title}</p>
                    {section.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm leading-6 text-slate-600"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            <div className="grid gap-3">
              <Link href="/contact" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" className="w-full rounded-full border border-slate-300 bg-transparent">
                  Talk to an expert
                </Button>
              </Link>
              <a href="/pricing#trial" onClick={() => setMobileOpen(false)}>
                <Button className="w-full rounded-full bg-slate-950 text-white hover:bg-slate-800">Start free trial</Button>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
