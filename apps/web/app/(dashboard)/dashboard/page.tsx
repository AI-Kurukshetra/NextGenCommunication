import { PageHeader } from "@/components/dashboard/page-header";
import { RealtimeIndicator } from "@/components/dashboard/realtime-indicator";
import { StatCard } from "@/components/dashboard/stat-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { Card, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Platform Dashboard"
        description="Realtime visibility into messaging, voice traffic, deliverability, and spend."
        action={<RealtimeIndicator />}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Messages (24h)" value="89,230" detail="+8.6% vs yesterday" />
        <StatCard label="Call Minutes (24h)" value="16,994" detail="+3.1% vs yesterday" />
        <StatCard label="Delivery Rate" value="98.23%" detail="Across all carriers" />
        <StatCard label="Fraud Flags" value="42" detail="0 critical in last 24h" />
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardTitle>Traffic Trend</CardTitle>
          <UsageChart />
        </Card>
        <Card>
          <CardTitle>System Health</CardTitle>
          <ul className="mt-4 space-y-2 text-sm">
            <li>API p95 latency: 84ms</li>
            <li>Webhook success: 99.5%</li>
            <li>Queue lag: 1.8s</li>
            <li>Carrier failover: Active</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
