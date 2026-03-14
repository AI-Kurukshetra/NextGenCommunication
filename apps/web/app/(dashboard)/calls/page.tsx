import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GradientAreaChart, GroupedBarChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatCurrency, formatDateTime, getDashboardContext, getStatusTone } from "@/lib/dashboard-context";

type CallRow = {
  id: string;
  from_number: string;
  to_number: string;
  status: string;
  direction: string;
  duration_seconds: number | null;
  created_at: string;
};

type CdrRow = {
  id: string;
  call_id: string;
  billable_seconds: number;
  billed_amount_usd: number;
  sip_response_code: number | null;
  created_at: string;
};

export default async function CallsPage() {
  const { supabase, organization } = await getDashboardContext();
  const [callsResult, cdrResult] = await Promise.all([
    supabase
      .from("calls")
      .select("id, from_number, to_number, status, direction, duration_seconds, created_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("call_detail_records")
      .select("id, call_id, billable_seconds, billed_amount_usd, sip_response_code, created_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  const rows = (callsResult.data ?? []) as CallRow[];
  const cdrRows = (cdrResult.data ?? []) as CdrRow[];
  const totalBillableSeconds = cdrRows.reduce((sum, row) => sum + Number(row.billable_seconds ?? 0), 0);
  const totalBilledAmount = cdrRows.reduce((sum, row) => sum + Number(row.billed_amount_usd ?? 0), 0);

  const statusBreakdown = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const directionBreakdown = Object.entries(
    rows.reduce<Record<string, { calls: number; minutes: number }>>((acc, row) => {
      if (!acc[row.direction]) {
        acc[row.direction] = { calls: 0, minutes: 0 };
      }
      acc[row.direction].calls += 1;
      acc[row.direction].minutes += Math.round(Number(row.duration_seconds ?? 0) / 60);
      return acc;
    }, {})
  ).map(([direction, totals]) => ({ direction, calls: totals.calls, minutes: totals.minutes }));

  const billingTrend = Object.entries(
    cdrRows.reduce<Record<string, { seconds: number; amount: number }>>((acc, row) => {
      const day = row.created_at.slice(0, 10);
      if (!acc[day]) {
        acc[day] = { seconds: 0, amount: 0 };
      }
      acc[day].seconds += Number(row.billable_seconds ?? 0);
      acc[day].amount += Number(row.billed_amount_usd ?? 0);
      return acc;
    }, {})
  )
    .map(([day, totals]) => ({ day, ...totals }))
    .sort((a, b) => (a.day < b.day ? -1 : 1));

  return (
    <div>
      <PageHeader title="Calls" description="Outbound and inbound voice sessions, recordings, and event timelines." />
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="text-lg font-semibold">Call Status</h3>
          <DonutChart className="mt-4" data={statusBreakdown} nameKey="status" valueKey="count" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Direction Mix</h3>
          <GroupedBarChart
            className="mt-4"
            data={directionBreakdown}
            xKey="direction"
            series={[
              { key: "calls", label: "Calls", color: "#0369a1" },
              { key: "minutes", label: "Minutes", color: "#f59e0b" }
            ]}
          />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">CDR Billing Trend</h3>
          <GradientAreaChart
            className="mt-4"
            data={billingTrend}
            xKey="day"
            series={[
              { key: "seconds", label: "Billable Seconds", color: "#0284c7" },
              { key: "amount", label: "Amount USD", color: "#0f766e" }
            ]}
          />
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Call SID</TH>
                <TH>From</TH>
                <TH>To</TH>
                <TH>Direction</TH>
                <TH>Status</TH>
                <TH>Duration</TH>
                <TH>Created</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD>{row.id.slice(0, 8)}</TD>
                  <TD>{row.from_number}</TD>
                  <TD>{row.to_number}</TD>
                  <TD>{row.direction}</TD>
                  <TD>
                    <Badge tone={getStatusTone(row.status)}>{row.status}</Badge>
                  </TD>
                  <TD>{Math.round(Number(row.duration_seconds ?? 0))}s</TD>
                  <TD>{formatDateTime(row.created_at)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>

        <Card>
          <div className="mb-3 text-sm text-slate-600">
            <p>Total billable seconds: <strong>{Math.round(totalBillableSeconds)}</strong></p>
            <p>Total billed amount: <strong>{formatCurrency(totalBilledAmount)}</strong></p>
          </div>
          <Table>
            <THead>
              <TR>
                <TH>CDR ID</TH>
                <TH>Call</TH>
                <TH>SIP</TH>
                <TH>Billable</TH>
                <TH>Amount</TH>
                <TH>Created</TH>
              </TR>
            </THead>
            <TBody>
              {cdrRows.map((row) => (
                <TR key={row.id}>
                  <TD>{row.id.slice(0, 8)}</TD>
                  <TD>{row.call_id.slice(0, 8)}</TD>
                  <TD>{row.sip_response_code ?? "-"}</TD>
                  <TD>{Math.round(Number(row.billable_seconds ?? 0))}s</TD>
                  <TD>{formatCurrency(Number(row.billed_amount_usd ?? 0))}</TD>
                  <TD>{formatDateTime(row.created_at)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
