import { PageHeader } from "@/components/dashboard/page-header";
import { RealtimeIndicator } from "@/components/dashboard/realtime-indicator";
import { StatCard } from "@/components/dashboard/stat-card";
import { DonutChart, GradientAreaChart } from "@/components/dashboard/charts";
import { Card, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatCurrency, formatDateTime, getDashboardContext } from "@/lib/dashboard-context";

type UsageRow = {
  event_type: string;
  units: number;
  amount_usd: number;
  occurred_at: string;
};

type MessageRow = {
  status: string;
  created_at: string;
};

type CallRow = {
  duration_seconds: number | null;
  created_at: string;
};

type WebhookAttemptRow = {
  success: boolean;
};

export default async function DashboardPage() {
  const { supabase, organization, user, role } = await getDashboardContext();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [messagesResult, callsResult, usageResult, webhookAttemptsResult] = await Promise.all([
    supabase
      .from("messages")
      .select("status, created_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .gte("created_at", since7d),
    supabase
      .from("calls")
      .select("duration_seconds, created_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .gte("created_at", since7d),
    supabase
      .from("usage_records")
      .select("event_type, units, amount_usd, occurred_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .gte("occurred_at", since7d)
      .order("occurred_at", { ascending: false })
      .limit(40),
    supabase
      .from("webhook_attempts")
      .select("success")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .gte("attempted_at", since24h)
  ]);

  const messages = (messagesResult.data ?? []) as MessageRow[];
  const calls = (callsResult.data ?? []) as CallRow[];
  const usageRows = (usageResult.data ?? []) as UsageRow[];
  const webhookAttempts = (webhookAttemptsResult.data ?? []) as WebhookAttemptRow[];

  const messages24h = messages.filter((item) => new Date(item.created_at).getTime() >= Date.now() - 24 * 60 * 60 * 1000);
  const calls24h = calls.filter((item) => new Date(item.created_at).getTime() >= Date.now() - 24 * 60 * 60 * 1000);

  const deliveredCount = messages24h.filter((item) => item.status === "delivered").length;
  const failedCount = messages24h.filter((item) => ["failed", "undelivered"].includes(item.status)).length;
  const attemptedDeliveryCount = deliveredCount + failedCount;
  const deliveryRate = attemptedDeliveryCount > 0 ? (deliveredCount / attemptedDeliveryCount) * 100 : 0;

  const callMinutes = calls24h.reduce((sum, call) => sum + Number(call.duration_seconds ?? 0), 0) / 60;
  const webhookSuccess = webhookAttempts.filter((item) => item.success).length;
  const webhookRate = webhookAttempts.length > 0 ? (webhookSuccess / webhookAttempts.length) * 100 : 100;

  const usageByEvent = usageRows.reduce<Record<string, { units: number; amount: number }>>((acc, row) => {
    if (!acc[row.event_type]) {
      acc[row.event_type] = { units: 0, amount: 0 };
    }

    acc[row.event_type].units += Number(row.units ?? 0);
    acc[row.event_type].amount += Number(row.amount_usd ?? 0);
    return acc;
  }, {});

  const usageSummaryRows = Object.entries(usageByEvent)
    .map(([eventType, totals]) => ({
      eventType,
      units: totals.units,
      amount: totals.amount
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const recentUsage = usageRows.slice(0, 1)[0];

  const dayBuckets = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000);
    const dayKey = date.toISOString().slice(0, 10);
    return {
      dayKey,
      dayLabel: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      messages: 0,
      callMinutes: 0
    };
  });

  const dayIndexByKey = new Map(dayBuckets.map((item, index) => [item.dayKey, index]));

  for (const row of messages) {
    const key = row.created_at.slice(0, 10);
    const idx = dayIndexByKey.get(key);
    if (idx !== undefined) {
      dayBuckets[idx].messages += 1;
    }
  }

  for (const row of calls) {
    const key = row.created_at.slice(0, 10);
    const idx = dayIndexByKey.get(key);
    if (idx !== undefined) {
      dayBuckets[idx].callMinutes += Math.round(Number(row.duration_seconds ?? 0) / 60);
    }
  }

  const statusBreakdown = Object.entries(
    messages.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  return (
    <div>
      <PageHeader
        title="Platform Dashboard"
        description={`${organization.name} | ${user.email} (${role})`}
        action={<RealtimeIndicator />}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Messages (24h)" value={messages24h.length.toLocaleString("en-US")} detail="Last 24 hours" />
        <StatCard label="Call Minutes (24h)" value={Math.round(callMinutes).toLocaleString("en-US")} detail="Total connected minutes" />
        <StatCard label="Delivery Rate" value={`${deliveryRate.toFixed(2)}%`} detail={`${failedCount} failed/undelivered`} />
        <StatCard
          label="Spend (7d)"
          value={formatCurrency(usageRows.reduce((sum, row) => sum + Number(row.amount_usd ?? 0), 0))}
          detail={recentUsage ? `Latest usage ${formatDateTime(recentUsage.occurred_at)}` : "No recent usage"}
        />
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardTitle>Traffic Trend (7d)</CardTitle>
          <GradientAreaChart
            className="mt-4"
            data={dayBuckets}
            xKey="dayLabel"
            series={[
              { key: "messages", label: "Messages", color: "#0284c7" },
              { key: "callMinutes", label: "Call Minutes", color: "#0f766e" }
            ]}
          />
        </Card>
        <Card>
          <CardTitle>Message Status Mix (7d)</CardTitle>
          <DonutChart className="mt-4" data={statusBreakdown} nameKey="status" valueKey="count" />
        </Card>
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardTitle>Usage Summary (7d)</CardTitle>
          <Table className="mt-4">
            <THead>
              <TR>
                <TH>Event</TH>
                <TH>Units</TH>
                <TH>Amount</TH>
              </TR>
            </THead>
            <TBody>
              {usageSummaryRows.map((row) => (
                <TR key={row.eventType}>
                  <TD>{row.eventType}</TD>
                  <TD>{Math.round(row.units).toLocaleString("en-US")}</TD>
                  <TD>{formatCurrency(row.amount)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
        <Card>
          <CardTitle>System Health</CardTitle>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Webhook success (24h): {webhookRate.toFixed(1)}%</li>
            <li>Webhook attempts (24h): {webhookAttempts.length}</li>
            <li>Active delivery issues (24h): {failedCount}</li>
            <li>Realtime feed: healthy</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
