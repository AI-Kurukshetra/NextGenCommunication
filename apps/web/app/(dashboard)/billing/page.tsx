import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DonutChart, GradientAreaChart } from "@/components/dashboard/charts";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatCurrency, formatShortDate, getDashboardContext } from "@/lib/dashboard-context";

type BillingRow = {
  plan: string;
  status: string;
  balance_usd: number;
  credit_limit_usd: number;
  billing_email: string;
};

type UsageRow = {
  event_type: string;
  amount_usd: number;
  occurred_at: string;
};

export default async function BillingPage() {
  const { supabase, organization } = await getDashboardContext();
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [billingResult, usageResult] = await Promise.all([
    supabase
      .from("billing_accounts")
      .select("plan, status, balance_usd, credit_limit_usd, billing_email")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("usage_records")
      .select("event_type, amount_usd, occurred_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .gte("occurred_at", since30d)
      .order("occurred_at", { ascending: false })
      .limit(50)
  ]);

  const billing = billingResult.data as BillingRow | null;
  const usageRows = (usageResult.data ?? []) as UsageRow[];

  const monthlySpend = usageRows.reduce((sum, row) => sum + Number(row.amount_usd ?? 0), 0);
  const dailySpend = usageRows.reduce<Record<string, number>>((acc, row) => {
    const day = row.occurred_at.slice(0, 10);
    acc[day] = (acc[day] ?? 0) + Number(row.amount_usd ?? 0);
    return acc;
  }, {});

  const spendRows = Object.entries(dailySpend)
    .map(([day, amount]) => ({ day, amount }))
    .sort((a, b) => (a.day < b.day ? -1 : 1))
    .slice(-14);

  const spendByEvent = Object.entries(
    usageRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.event_type] = (acc[row.event_type] ?? 0) + Number(row.amount_usd ?? 0);
      return acc;
    }, {})
  ).map(([eventType, amount]) => ({ eventType, amount: Number(amount.toFixed(4)) }));

  return (
    <div>
      <PageHeader title="Billing" description="Balance, invoices, and pricing controls by organization." />
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Current Balance" value={formatCurrency(Number(billing?.balance_usd ?? 0))} detail={billing?.status ?? "unknown"} />
        <StatCard label="Credit Limit" value={formatCurrency(Number(billing?.credit_limit_usd ?? 0))} detail={billing?.plan ?? "-"} />
        <StatCard label="30-day Spend" value={formatCurrency(monthlySpend)} detail={billing?.billing_email ?? "-"} />
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Daily Spend Trend</h3>
          <GradientAreaChart
            className="mt-4"
            data={spendRows.map((row) => ({ ...row, label: formatShortDate(row.day) }))}
            xKey="label"
            series={[{ key: "amount", label: "Spend USD", color: "#0284c7" }]}
          />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Spend Mix by Event</h3>
          <DonutChart className="mt-4" data={spendByEvent} nameKey="eventType" valueKey="amount" />
        </Card>
      </section>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Day</TH>
              <TH>Spend</TH>
            </TR>
          </THead>
          <TBody>
            {[...spendRows].reverse().map((row) => (
              <TR key={row.day}>
                <TD>{formatShortDate(row.day)}</TD>
                <TD>{formatCurrency(row.amount)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
