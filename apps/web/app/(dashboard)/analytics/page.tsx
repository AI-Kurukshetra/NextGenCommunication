import { PageHeader } from "@/components/dashboard/page-header";
import { GroupedBarChart, GradientAreaChart } from "@/components/dashboard/charts";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatCurrency, formatShortDate, getDashboardContext } from "@/lib/dashboard-context";

type UsageRow = {
  id: string;
  event_type: string;
  units: number;
  amount_usd: number;
  occurred_at: string;
};

export default async function AnalyticsPage() {
  const { supabase, organization } = await getDashboardContext();
  const { data } = await supabase
    .from("usage_records")
    .select("id, event_type, units, amount_usd, occurred_at")
    .eq("organization_id", organization.id)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as UsageRow[];

  const totalsByEvent = rows.reduce<Record<string, { units: number; amount: number }>>((acc, row) => {
    if (!acc[row.event_type]) {
      acc[row.event_type] = { units: 0, amount: 0 };
    }

    acc[row.event_type].units += Number(row.units ?? 0);
    acc[row.event_type].amount += Number(row.amount_usd ?? 0);
    return acc;
  }, {});

  const topEvents = Object.entries(totalsByEvent)
    .map(([eventType, totals]) => ({ eventType, ...totals }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const totalsByDay = rows.reduce<Record<string, { units: number; amount: number }>>((acc, row) => {
    const day = row.occurred_at.slice(0, 10);
    if (!acc[day]) {
      acc[day] = { units: 0, amount: 0 };
    }

    acc[day].units += Number(row.units ?? 0);
    acc[day].amount += Number(row.amount_usd ?? 0);
    return acc;
  }, {});

  const dailyRows = Object.entries(totalsByDay)
    .map(([day, totals]) => ({ day, ...totals }))
    .sort((a, b) => (a.day < b.day ? -1 : 1))
    .slice(-14);

  return (
    <div>
      <PageHeader title="Analytics" description="Usage and deliverability metrics with tenant scoped reporting." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Daily Usage Trend</h3>
          <GradientAreaChart
            className="mt-4"
            data={dailyRows.map((day) => ({
              ...day,
              label: formatShortDate(day.day)
            }))}
            xKey="label"
            series={[
              { key: "units", label: "Units", color: "#0284c7" },
              { key: "amount", label: "Amount USD", color: "#f59e0b" }
            ]}
          />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Top Usage Events</h3>
          <GroupedBarChart
            className="mt-4"
            data={topEvents}
            xKey="eventType"
            series={[
              { key: "units", label: "Units", color: "#0f766e" },
              { key: "amount", label: "Amount USD", color: "#0369a1" }
            ]}
          />
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Event</TH>
                <TH>Units</TH>
                <TH>Amount</TH>
              </TR>
            </THead>
            <TBody>
              {topEvents.map((event) => (
                <TR key={event.eventType}>
                  <TD>{event.eventType}</TD>
                  <TD>{Math.round(event.units).toLocaleString("en-US")}</TD>
                  <TD>{formatCurrency(event.amount)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Day</TH>
                <TH>Units</TH>
                <TH>Amount</TH>
              </TR>
            </THead>
            <TBody>
              {[...dailyRows].reverse().map((day) => (
                <TR key={day.day}>
                  <TD>{formatShortDate(day.day)}</TD>
                  <TD>{Math.round(day.units).toLocaleString("en-US")}</TD>
                  <TD>{formatCurrency(day.amount)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
