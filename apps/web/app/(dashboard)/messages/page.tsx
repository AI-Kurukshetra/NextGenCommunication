import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GroupedBarChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDateTime, getDashboardContext, getStatusTone } from "@/lib/dashboard-context";

type MessageRow = {
  id: string;
  to_number: string;
  from_number: string;
  status: string;
  segment_count: number;
  direction: string;
  created_at: string;
};

export default async function MessagesPage() {
  const { supabase, organization } = await getDashboardContext();
  const { data } = await supabase
    .from("messages")
    .select("id, to_number, from_number, status, segment_count, direction, created_at")
    .eq("organization_id", organization.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(25);

  const rows = (data ?? []) as MessageRow[];
  const statusBreakdown = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const directionBreakdown = Object.entries(
    rows.reduce<Record<string, { messages: number; segments: number }>>((acc, row) => {
      if (!acc[row.direction]) {
        acc[row.direction] = { messages: 0, segments: 0 };
      }
      acc[row.direction].messages += 1;
      acc[row.direction].segments += Number(row.segment_count ?? 0);
      return acc;
    }, {})
  ).map(([direction, totals]) => ({
    direction,
    messages: totals.messages,
    segments: totals.segments
  }));

  return (
    <div>
      <PageHeader title="Messages" description="SMS and MMS logs with delivery receipts and segment accounting." />
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Message Status Distribution</h3>
          <DonutChart className="mt-4" data={statusBreakdown} nameKey="status" valueKey="count" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Direction and Segment Load</h3>
          <GroupedBarChart
            className="mt-4"
            data={directionBreakdown}
            xKey="direction"
            series={[
              { key: "messages", label: "Messages", color: "#0369a1" },
              { key: "segments", label: "Segments", color: "#0f766e" }
            ]}
          />
        </Card>
      </div>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>ID</TH>
              <TH>To</TH>
              <TH>From</TH>
              <TH>Direction</TH>
              <TH>Segments</TH>
              <TH>Status</TH>
              <TH>Created</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={row.id}>
                <TD>{row.id.slice(0, 8)}</TD>
                <TD>{row.to_number}</TD>
                <TD>{row.from_number}</TD>
                <TD>{row.direction}</TD>
                <TD>{row.segment_count}</TD>
                <TD>
                  <Badge tone={getStatusTone(row.status)}>
                    {row.status}
                  </Badge>
                </TD>
                <TD>{formatDateTime(row.created_at)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
