import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GroupedBarChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDateTime, getDashboardContext, getStatusTone } from "@/lib/dashboard-context";

type CampaignRow = {
  id: string;
  name: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  scheduled_at: string | null;
};

export default async function CampaignsPage() {
  const { supabase, organization } = await getDashboardContext();
  const { data } = await supabase
    .from("campaigns")
    .select("id, name, status, total_recipients, sent_count, failed_count, scheduled_at")
    .eq("organization_id", organization.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  const campaigns = (data ?? []) as CampaignRow[];
  const statusBreakdown = Object.entries(
    campaigns.reduce<Record<string, number>>((acc, campaign) => {
      acc[campaign.status] = (acc[campaign.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const campaignPerformance = campaigns.slice(0, 8).map((campaign) => ({
    name: campaign.name.split(" ").slice(0, 2).join(" "),
    sent: Number(campaign.sent_count ?? 0),
    failed: Number(campaign.failed_count ?? 0),
    recipients: Number(campaign.total_recipients ?? 0)
  }));

  return (
    <div>
      <PageHeader title="Campaigns" description="Bulk messaging with scheduling, segmentation, and throughput controls." />
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Campaign Status Distribution</h3>
          <DonutChart className="mt-4" data={statusBreakdown} nameKey="status" valueKey="count" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Campaign Outcomes</h3>
          <GroupedBarChart
            className="mt-4"
            data={campaignPerformance}
            xKey="name"
            series={[
              { key: "recipients", label: "Recipients", color: "#0284c7" },
              { key: "sent", label: "Sent", color: "#0f766e" },
              { key: "failed", label: "Failed", color: "#ef4444" }
            ]}
          />
        </Card>
      </div>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Status</TH>
              <TH>Total</TH>
              <TH>Sent</TH>
              <TH>Failed</TH>
              <TH>Scheduled</TH>
            </TR>
          </THead>
          <TBody>
            {campaigns.map((campaign) => (
              <TR key={campaign.id}>
                <TD>{campaign.name}</TD>
                <TD>
                  <Badge tone={getStatusTone(campaign.status)}>{campaign.status}</Badge>
                </TD>
                <TD>{campaign.total_recipients}</TD>
                <TD>{campaign.sent_count}</TD>
                <TD>{campaign.failed_count}</TD>
                <TD>{formatDateTime(campaign.scheduled_at)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
