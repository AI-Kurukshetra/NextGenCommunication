import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GroupedBarChart } from "@/components/dashboard/charts";
import { Card, CardTitle } from "@/components/ui/card";
import { getDashboardContext } from "@/lib/dashboard-context";

type ApiKeyRow = {
  last_four: string;
};

type OAuthClientRow = {
  client_id: string;
  default_scope: string;
};

type UsageRow = {
  event_type: string;
  units: number;
};

export default async function DeveloperPortalPage() {
  const { supabase, organization, application } = await getDashboardContext();
  const [apiKeyResult, oauthResult, apiKeysResult, oauthClientsResult, usageResult] = await Promise.all([
    supabase
      .from("api_keys")
      .select("last_four")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("oauth_clients")
      .select("client_id, default_scope")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("api_keys")
      .select("id, is_active")
      .eq("organization_id", organization.id)
      .is("deleted_at", null),
    supabase
      .from("oauth_clients")
      .select("id, is_active")
      .eq("organization_id", organization.id)
      .is("deleted_at", null),
    supabase
      .from("usage_records")
      .select("event_type, units")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false })
      .limit(60)
  ]);

  const apiKey = apiKeyResult.data as ApiKeyRow | null;
  const oauthClient = oauthResult.data as OAuthClientRow | null;
  const usageRows = (usageResult.data ?? []) as UsageRow[];
  const keyRows = (apiKeysResult.data ?? []) as Array<{ id: string; is_active: boolean }>;
  const oauthRows = (oauthClientsResult.data ?? []) as Array<{ id: string; is_active: boolean }>;

  const authMix = [
    { type: "API Keys", count: keyRows.length },
    { type: "OAuth Clients", count: oauthRows.length },
    { type: "Active Keys", count: keyRows.filter((row) => row.is_active).length },
    { type: "Active OAuth", count: oauthRows.filter((row) => row.is_active).length }
  ];

  const endpointLoad = Object.entries(
    usageRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.event_type] = (acc[row.event_type] ?? 0) + Number(row.units ?? 0);
      return acc;
    }, {})
  )
    .map(([eventType, units]) => ({ eventType, units }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);

  const curlSend = `curl -X POST http://localhost:3000/api/messages/send \\
  -H "Authorization: Bearer sk_test_****${apiKey?.last_four ?? "0000"}" \\
  -H "Content-Type: application/json" \\
  -d '{\n    "to": "+1234567890",\n    "from": "+1987654321",\n    "text": "Hello from curl"\n  }'`;

  const sdkExample = `import { CPaaSClient } from "@nextgen/cpaas-sdk";

const client = new CPaaSClient({
  apiKey: process.env.CPAAS_API_KEY!,
  baseUrl: "http://localhost:3000"
});

await client.messages.send({
  to: "+1234567890",
  from: "+1987654321",
  text: "Hello World"
});`;

  return (
    <div>
      <PageHeader
        title="Developer Portal"
        description={`${organization.name} | ${application?.name ?? "Default App"}`}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>API Demand by Event</CardTitle>
          <GroupedBarChart
            className="mt-4"
            data={endpointLoad}
            xKey="eventType"
            series={[{ key: "units", label: "Units", color: "#0284c7" }]}
          />
        </Card>
        <Card>
          <CardTitle>Credential Topology</CardTitle>
          <DonutChart className="mt-4" data={authMix} nameKey="type" valueKey="count" />
        </Card>
        <Card>
          <CardTitle>cURL Example</CardTitle>
          <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">{curlSend}</pre>
        </Card>
        <Card>
          <CardTitle>Node SDK Example</CardTitle>
          <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">{sdkExample}</pre>
        </Card>
        <Card>
          <CardTitle>Webhook Testing</CardTitle>
          <p className="mt-2 text-sm">Use `/api/webhooks/:provider` with sample payloads for inbound SMS and call events.</p>
          <p className="mt-2 text-sm">OAuth client: <code>{oauthClient?.client_id ?? "not-seeded"}</code></p>
          <p className="mt-2 text-sm">Default scope: {oauthClient?.default_scope ?? "-"}</p>
        </Card>
        <Card>
          <CardTitle>Sandbox Credentials</CardTitle>
          <p className="mt-2 text-sm">Latest API key tail: <code>{apiKey ? `****${apiKey.last_four}` : "n/a"}</code></p>
          <p className="mt-2 text-sm">Base URL: <code>http://localhost:3000</code></p>
        </Card>
      </div>
    </div>
  );
}
