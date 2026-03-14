import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GroupedBarChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatShortDate, getDashboardContext, getStatusTone } from "@/lib/dashboard-context";

type TemplateRow = {
  id: string;
  name: string;
  channel: string;
  status: string;
  variables: string[];
  approved_at: string | null;
};

export default async function TemplatesPage() {
  const { supabase, organization } = await getDashboardContext();
  const { data } = await supabase
    .from("templates")
    .select("id, name, channel, status, variables, approved_at")
    .eq("organization_id", organization.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  const templates = (data ?? []) as TemplateRow[];
  const statusMix = Object.entries(
    templates.reduce<Record<string, number>>((acc, template) => {
      acc[template.status] = (acc[template.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const variableComplexity = Object.entries(
    templates.reduce<Record<string, { templates: number; variables: number }>>((acc, template) => {
      if (!acc[template.channel]) {
        acc[template.channel] = { templates: 0, variables: 0 };
      }
      acc[template.channel].templates += 1;
      acc[template.channel].variables += (template.variables ?? []).length;
      return acc;
    }, {})
  ).map(([channel, totals]) => ({ channel, ...totals }));

  return (
    <div>
      <PageHeader title="Templates" description="Template authoring with approval lifecycle and compliance metadata." />
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Approval Status Mix</h3>
          <DonutChart className="mt-4" data={statusMix} nameKey="status" valueKey="count" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Template Complexity</h3>
          <GroupedBarChart
            className="mt-4"
            data={variableComplexity}
            xKey="channel"
            series={[
              { key: "templates", label: "Templates", color: "#0284c7" },
              { key: "variables", label: "Variables", color: "#0f766e" }
            ]}
          />
        </Card>
      </div>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Channel</TH>
              <TH>Variables</TH>
              <TH>Status</TH>
              <TH>Approved</TH>
            </TR>
          </THead>
          <TBody>
            {templates.map((template) => (
              <TR key={template.id}>
                <TD>{template.name}</TD>
                <TD>{template.channel}</TD>
                <TD>{template.variables?.length ? template.variables.join(", ") : "-"}</TD>
                <TD>
                  <Badge tone={getStatusTone(template.status)}>{template.status}</Badge>
                </TD>
                <TD>{formatShortDate(template.approved_at)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
