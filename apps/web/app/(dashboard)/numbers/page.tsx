import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GroupedBarChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getDashboardContext, getStatusTone } from "@/lib/dashboard-context";

type NumberRow = {
  id: string;
  e164_number: string;
  number_type: string;
  status: string;
  application_id: string | null;
  provider: string;
};

type ApplicationRow = {
  id: string;
  name: string;
};

export default async function NumbersPage() {
  const { supabase, organization } = await getDashboardContext();

  const [numbersResult, applicationsResult] = await Promise.all([
    supabase
      .from("phone_numbers")
      .select("id, e164_number, number_type, status, application_id, provider")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("applications")
      .select("id, name")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
  ]);

  const numbers = (numbersResult.data ?? []) as NumberRow[];
  const applications = (applicationsResult.data ?? []) as ApplicationRow[];
  const appNameMap = new Map(applications.map((app) => [app.id, app.name]));

  const statusMix = Object.entries(
    numbers.reduce<Record<string, number>>((acc, number) => {
      acc[number.status] = (acc[number.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const typeByApp = Object.entries(
    numbers.reduce<Record<string, { local: number; toll_free: number; other: number }>>((acc, number) => {
      const appName = number.application_id ? appNameMap.get(number.application_id) ?? "Unknown App" : "Unassigned";
      if (!acc[appName]) {
        acc[appName] = { local: 0, toll_free: 0, other: 0 };
      }

      if (number.number_type === "local") {
        acc[appName].local += 1;
      } else if (number.number_type === "toll_free") {
        acc[appName].toll_free += 1;
      } else {
        acc[appName].other += 1;
      }
      return acc;
    }, {})
  ).map(([application, totals]) => ({ application, ...totals }));

  return (
    <div>
      <PageHeader title="Phone Numbers" description="Inventory, assignment, purchase, and port-in management." />
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Number Status Distribution</h3>
          <DonutChart className="mt-4" data={statusMix} nameKey="status" valueKey="count" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Number Types by Application</h3>
          <GroupedBarChart
            className="mt-4"
            data={typeByApp}
            xKey="application"
            series={[
              { key: "local", label: "Local", color: "#0369a1" },
              { key: "toll_free", label: "Toll-free", color: "#0f766e" },
              { key: "other", label: "Other", color: "#f59e0b" }
            ]}
          />
        </Card>
      </div>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Number</TH>
              <TH>Type</TH>
              <TH>Application</TH>
              <TH>Provider</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {numbers.map((number) => (
              <TR key={number.id}>
                <TD>{number.e164_number}</TD>
                <TD>{number.number_type}</TD>
                <TD>{number.application_id ? appNameMap.get(number.application_id) ?? "-" : "-"}</TD>
                <TD>{number.provider}</TD>
                <TD>
                  <Badge tone={getStatusTone(number.status)}>{number.status}</Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
