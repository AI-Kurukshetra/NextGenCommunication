import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GroupedBarChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDateTime, getDashboardContext, getStatusTone } from "@/lib/dashboard-context";

type WebhookAttemptRow = {
  id: string;
  event_type: string;
  success: boolean;
  response_status: number | null;
  attempted_at: string;
};

type ReceiptRow = {
  id: string;
  status: string;
  provider: string;
  received_at: string;
};

export default async function LogsPage() {
  const { supabase, organization } = await getDashboardContext();

  const [attemptsResult, receiptsResult] = await Promise.all([
    supabase
      .from("webhook_attempts")
      .select("id, event_type, success, response_status, attempted_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("attempted_at", { ascending: false })
      .limit(12),
    supabase
      .from("delivery_receipts")
      .select("id, status, provider, received_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("received_at", { ascending: false })
      .limit(12)
  ]);

  const attempts = (attemptsResult.data ?? []) as WebhookAttemptRow[];
  const receipts = (receiptsResult.data ?? []) as ReceiptRow[];

  const logRows = [
    ...attempts.map((attempt) => ({
      id: attempt.id,
      source: "webhook",
      type: attempt.event_type,
      status: attempt.success ? "succeeded" : "failed",
      detail: attempt.response_status ? `HTTP ${attempt.response_status}` : "No response",
      createdAt: attempt.attempted_at
    })),
    ...receipts.map((receipt) => ({
      id: receipt.id,
      source: "delivery",
      type: `receipt.${receipt.provider}`,
      status: receipt.status,
      detail: "Provider receipt",
      createdAt: receipt.received_at
    }))
  ]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 20);

  const sourceBreakdown = Object.entries(
    logRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.source] = (acc[row.source] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([source, count]) => ({ source, count }));

  const statusTrend = Object.entries(
    logRows.reduce<Record<string, { success: number; issues: number }>>((acc, row) => {
      const day = row.createdAt.slice(0, 10);
      if (!acc[day]) {
        acc[day] = { success: 0, issues: 0 };
      }
      if (["succeeded", "delivered", "completed", "verified"].includes(row.status)) {
        acc[day].success += 1;
      } else {
        acc[day].issues += 1;
      }
      return acc;
    }, {})
  )
    .map(([day, totals]) => ({ day, ...totals }))
    .sort((a, b) => (a.day < b.day ? -1 : 1));

  return (
    <div>
      <PageHeader title="Logs" description="Structured request, event, and webhook logs for audit and debugging." />
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Log Source Distribution</h3>
          <DonutChart className="mt-4" data={sourceBreakdown} nameKey="source" valueKey="count" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Success vs Issue Trend</h3>
          <GroupedBarChart
            className="mt-4"
            data={statusTrend}
            xKey="day"
            series={[
              { key: "success", label: "Success", color: "#0f766e" },
              { key: "issues", label: "Issues", color: "#ef4444" }
            ]}
          />
        </Card>
      </div>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Source</TH>
              <TH>Type</TH>
              <TH>Status</TH>
              <TH>Detail</TH>
              <TH>Time</TH>
            </TR>
          </THead>
          <TBody>
            {logRows.map((row) => (
              <TR key={row.id}>
                <TD>{row.source}</TD>
                <TD>{row.type}</TD>
                <TD>
                  <Badge tone={getStatusTone(row.status)}>{row.status}</Badge>
                </TD>
                <TD>{row.detail}</TD>
                <TD>{formatDateTime(row.createdAt)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
