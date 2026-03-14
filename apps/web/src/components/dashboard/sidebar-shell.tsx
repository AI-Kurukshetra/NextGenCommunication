"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  ContactRound,
  CreditCard,
  KeySquare,
  Logs,
  Megaphone,
  MessageSquare,
  Phone,
  Settings,
  Shapes,
  Webhook
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Core",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Activity },
      { href: "/messages", label: "Messages", icon: MessageSquare },
      { href: "/calls", label: "Calls", icon: Phone },
      { href: "/numbers", label: "Phone Numbers", icon: Phone },
      { href: "/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/contacts", label: "Contacts", icon: ContactRound },
      { href: "/templates", label: "Templates", icon: Shapes },
      { href: "/webhooks", label: "Webhooks", icon: Webhook }
    ]
  },
  {
    title: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: Activity },
      { href: "/billing", label: "Billing", icon: CreditCard },
      { href: "/logs", label: "Logs", icon: Logs }
    ]
  },
  {
    title: "Platform",
    items: [
      { href: "/api-keys", label: "API Keys", icon: KeySquare },
      { href: "/developer-portal", label: "Developer Portal", icon: BookOpen },
      { href: "/settings", label: "Settings", icon: Settings }
    ]
  }
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarShell() {
  const pathname = usePathname();

  return (
    <aside className="relative overflow-hidden border-r border-slate-200/70 bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_38%,#22344e_100%)] p-5 text-slate-100 lg:p-6">
      <div className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-full bg-orange-300/10 blur-3xl" />

      <div className="relative flex h-full flex-col">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">NextGen</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">CPaaS Console</h1>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            Operator workspace for messaging, voice, routing, analytics, and automation.
          </p>
        </div>

        <nav className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300/90">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-white text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.25)]"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-lg",
                        active ? "bg-slate-100 text-slate-800" : "bg-white/10 text-slate-200"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
          <SignOutButton className="border border-white/20 bg-white/10 text-white hover:bg-white/20" />
        </div>
      </div>
    </aside>
  );
}
