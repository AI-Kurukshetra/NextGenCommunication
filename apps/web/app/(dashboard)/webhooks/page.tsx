import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GradientAreaChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDateTime, getDashboardContext, getStatusTone } from "@/lib/dashboard-context";

type WebhookRow = {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  subscribed_events: string[];
  timeout_ms: number;
};

type AttemptRow = {
  id: string;
  event_type: string;
  success: boolean;
  response_status: number | null;
  retry_count: number;
  attempted_at: string;
};

export default async function WebhooksPage() {
  const { supabase, organization } = await getDashboardContext();
  const [webhooksResult, attemptsResult] = await Promise.all([
    supabase
      .from("webhooks")
      .select("id, name, url, is_active, subscribed_events, timeout_ms")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("webhook_attempts")
      .select("id, event_type, success, response_status, retry_count, attempted_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("attempted_at", { ascending: false })
      .limit(15)
  ]);

  const webhooks = (webhooksResult.data ?? []) as WebhookRow[];
  const attempts = (attemptsResult.data ?? []) as AttemptRow[];

  const attemptsByResult = [
    { result: "succeeded", count: attempts.filter((attempt) => attempt.success).length },
    { result: "failed", count: attempts.filter((attempt) => !attempt.success).length }
  ];

  const attemptsByDay = Object.entries(
    attempts.reduce<Record<string, { succeeded: number; failed: number }>>((acc, attempt) => {
      const day = attempt.attempted_at.slice(0, 10);
      if (!acc[day]) {
        acc[day] = { succeeded: 0, failed: 0 };
      }

      if (attempt.success) {
        acc[day].succeeded += 1;
      } else {
        acc[day].failed += 1;
      }
      return acc;
    }, {})
  )
    .map(([day, totals]) => ({ day, ...totals }))
    .sort((a, b) => (a.day < b.day ? -1 : 1));

  return (
    <div>
      <PageHeader title="Webhooks" description="Event destination management with retries, signatures, and dead-letter visibility." />
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Attempt Outcome Split</h3>
          <DonutChart className="mt-4" data={attemptsByResult} nameKey="result" valueKey="count" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Attempt Trend by Day</h3>
          <GradientAreaChart
            className="mt-4"
            data={attemptsByDay}
            xKey="day"
            series={[
              { key: "succeeded", label: "Succeeded", color: "#0f766e" },
              { key: "failed", label: "Failed", color: "#ef4444" }
            ]}
          />
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Endpoint</TH>
                <TH>Events</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {webhooks.map((webhook) => (
                <TR key={webhook.id}>
                  <TD>{webhook.name}</TD>
                  <TD className="max-w-[280px] truncate">{webhook.url}</TD>
                  <TD>{webhook.subscribed_events?.length ?? 0}</TD>
                  <TD>
                    <Badge tone={webhook.is_active ? "success" : "warning"}>
                      {webhook.is_active ? "active" : "inactive"}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Event</TH>
                <TH>Status</TH>
                <TH>HTTP</TH>
                <TH>Retries</TH>
                <TH>When</TH>
              </TR>
            </THead>
            <TBody>
              {attempts.map((attempt) => (
                <TR key={attempt.id}>
                  <TD>{attempt.event_type}</TD>
                  <TD>
                    <Badge tone={getStatusTone(attempt.success ? "succeeded" : "failed")}>
                      {attempt.success ? "succeeded" : "failed"}
                    </Badge>
                  </TD>
                  <TD>{attempt.response_status ?? "-"}</TD>
                  <TD>{attempt.retry_count}</TD>
                  <TD>{formatDateTime(attempt.attempted_at)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
