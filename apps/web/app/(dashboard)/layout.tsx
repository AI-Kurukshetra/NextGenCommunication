import type { Route } from "next";
import Link from "next/link";
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

const navItems: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/numbers", label: "Phone Numbers", icon: Phone },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/contacts", label: "Contacts", icon: ContactRound },
  { href: "/templates", label: "Templates", icon: Shapes },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/analytics", label: "Analytics", icon: Activity },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/api-keys", label: "API Keys", icon: KeySquare },
  { href: "/logs", label: "Logs", icon: Logs },
  { href: "/developer-portal", label: "Developer Portal", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="bg-card/90 backdrop-blur border-r border-border p-5">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">NextGen</p>
          <h1 className="text-2xl font-semibold">CPaaS Console</h1>
        </div>
        <nav className="space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="p-5 lg:p-8">{children}</main>
    </div>
  );
}
