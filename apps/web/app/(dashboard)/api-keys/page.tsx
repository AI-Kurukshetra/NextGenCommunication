import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GroupedBarChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDateTime, getDashboardContext } from "@/lib/dashboard-context";

type ApiKeyRow = {
  id: string;
  name: string;
  last_four: string;
  scopes: string[];
  rate_limit_per_minute: number;
  is_active: boolean;
  application_id: string;
  last_used_at: string | null;
};

type ApplicationRow = {
  id: string;
  name: string;
};

export default async function ApiKeysPage() {
  const { supabase, organization } = await getDashboardContext();
  const [keysResult, appsResult] = await Promise.all([
    supabase
      .from("api_keys")
      .select("id, name, last_four, scopes, rate_limit_per_minute, is_active, application_id, last_used_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("applications")
      .select("id, name")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
  ]);

  const keys = (keysResult.data ?? []) as ApiKeyRow[];
  const apps = (appsResult.data ?? []) as ApplicationRow[];
  const appNameMap = new Map(apps.map((app) => [app.id, app.name]));

  const keyStatusMix = [
    { status: "active", count: keys.filter((key) => key.is_active).length },
    { status: "inactive", count: keys.filter((key) => !key.is_active).length }
  ];

  const keyLimitsByApp = Object.entries(
    keys.reduce<Record<string, { keyCount: number; rateLimit: number }>>((acc, key) => {
      const appName = appNameMap.get(key.application_id) ?? "Unknown App";
      if (!acc[appName]) {
        acc[appName] = { keyCount: 0, rateLimit: 0 };
      }
      acc[appName].keyCount += 1;
      acc[appName].rateLimit += Number(key.rate_limit_per_minute ?? 0);
      return acc;
    }, {})
  ).map(([application, totals]) => ({
    application,
    keyCount: totals.keyCount,
    rateLimit: totals.rateLimit
  }));

  return (
    <div>
      <PageHeader title="API Keys" description="Per-application key lifecycle with scopes and rotation windows." />
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Key Status Mix</h3>
          <DonutChart className="mt-4" data={keyStatusMix} nameKey="status" valueKey="count" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Capacity by Application</h3>
          <GroupedBarChart
            className="mt-4"
            data={keyLimitsByApp}
            xKey="application"
            series={[
              { key: "keyCount", label: "Keys", color: "#0369a1" },
              { key: "rateLimit", label: "Rate Limit/min", color: "#0f766e" }
            ]}
          />
        </Card>
      </div>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Application</TH>
              <TH>Key Tail</TH>
              <TH>Scopes</TH>
              <TH>Rate Limit</TH>
              <TH>Status</TH>
              <TH>Last Used</TH>
            </TR>
          </THead>
          <TBody>
            {keys.map((key) => (
              <TR key={key.id}>
                <TD>{key.name}</TD>
                <TD>{appNameMap.get(key.application_id) ?? "-"}</TD>
                <TD>****{key.last_four}</TD>
                <TD>{key.scopes?.length ? key.scopes.join(", ") : "-"}</TD>
                <TD>{key.rate_limit_per_minute}/min</TD>
                <TD>
                  <Badge tone={key.is_active ? "success" : "danger"}>
                    {key.is_active ? "active" : "inactive"}
                  </Badge>
                </TD>
                <TD>{formatDateTime(key.last_used_at)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
