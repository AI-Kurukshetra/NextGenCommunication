import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GroupedBarChart } from "@/components/dashboard/charts";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getDashboardContext } from "@/lib/dashboard-context";

type MembershipRow = {
  user_id: string;
  role: string;
  created_at: string;
};

type ApplicationRow = {
  id: string;
  name: string;
  slug: string;
};

type QuotaRow = {
  id: string;
  quota_key: string;
  limit_value: number;
  quota_window: "daily" | "monthly";
  application_id: string | null;
  is_active: boolean;
};

export default async function SettingsPage() {
  const { supabase, organization, user, role } = await getDashboardContext();

  const [membershipsResult, applicationsResult, webhooksResult, emergencyResult, sipResult, quotasResult] = await Promise.all([
    supabase
      .from("organization_members")
      .select("user_id, role, created_at")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("applications")
      .select("id, name, slug")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("webhooks")
      .select("id")
      .eq("organization_id", organization.id)
      .is("deleted_at", null),
    supabase
      .from("emergency_locations")
      .select("id")
      .eq("organization_id", organization.id)
      .is("deleted_at", null),
    supabase
      .from("sip_endpoints")
      .select("id")
      .eq("organization_id", organization.id)
      .is("deleted_at", null),
    supabase
      .from("api_quotas")
      .select("id, quota_key, limit_value, quota_window, application_id, is_active")
      .eq("organization_id", organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(25)
  ]);

  const memberships = (membershipsResult.data ?? []) as MembershipRow[];
  const applications = (applicationsResult.data ?? []) as ApplicationRow[];
  const quotas = (quotasResult.data ?? []) as QuotaRow[];
  const appNameById = new Map(applications.map((app) => [app.id, app.name]));
  const webhookCount = (webhooksResult.data ?? []).length;
  const emergencyLocationCount = (emergencyResult.data ?? []).length;
  const sipEndpointCount = (sipResult.data ?? []).length;

  const memberRoleMix = Object.entries(
    memberships.reduce<Record<string, number>>((acc, membership) => {
      acc[membership.role] = (acc[membership.role] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([roleKey, count]) => ({ roleKey, count }));

  const quotaMix = Object.entries(
    quotas.reduce<Record<string, { count: number; totalLimit: number }>>((acc, quota) => {
      if (!acc[quota.quota_window]) {
        acc[quota.quota_window] = { count: 0, totalLimit: 0 };
      }
      acc[quota.quota_window].count += 1;
      acc[quota.quota_window].totalLimit += Number(quota.limit_value ?? 0);
      return acc;
    }, {})
  ).map(([quotaWindow, totals]) => ({ quotaWindow, ...totals }));

  return (
    <div>
      <PageHeader title="Settings" description="Org policies, auth controls, and compliance preferences." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm"><strong>Organization:</strong> {organization.name}</p>
          <p className="mt-2 text-sm"><strong>Slug:</strong> {organization.slug}</p>
          <p className="mt-2 text-sm"><strong>Your user:</strong> {user.email}</p>
          <p className="mt-2 text-sm"><strong>Your role:</strong> {role}</p>
          <p className="mt-2 text-sm"><strong>Webhooks configured:</strong> {webhookCount}</p>
          <p className="mt-2 text-sm"><strong>Emergency locations:</strong> {emergencyLocationCount}</p>
          <p className="mt-2 text-sm"><strong>SIP endpoints:</strong> {sipEndpointCount}</p>
        </Card>
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Application</TH>
                <TH>Slug</TH>
              </TR>
            </THead>
            <TBody>
              {applications.map((app) => (
                <TR key={app.id}>
                  <TD>{app.name}</TD>
                  <TD>{app.slug}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Member Role Distribution</h3>
          <DonutChart className="mt-4" data={memberRoleMix} nameKey="roleKey" valueKey="count" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Quota Allocation by Window</h3>
          <GroupedBarChart
            className="mt-4"
            data={quotaMix}
            xKey="quotaWindow"
            series={[
              { key: "count", label: "Quota Rules", color: "#0369a1" },
              { key: "totalLimit", label: "Total Limit", color: "#0f766e" }
            ]}
          />
        </Card>
      </div>
      <Card className="mt-4">
        <Table>
          <THead>
            <TR>
              <TH>User ID</TH>
              <TH>Role</TH>
            </TR>
          </THead>
          <TBody>
            {memberships.map((member) => (
              <TR key={member.user_id}>
                <TD>{member.user_id}</TD>
                <TD>{member.role}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
      <Card className="mt-4">
        <Table>
          <THead>
            <TR>
              <TH>Quota Key</TH>
              <TH>Limit</TH>
              <TH>Window</TH>
              <TH>Application</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {quotas.map((quota) => (
              <TR key={quota.id}>
                <TD>{quota.quota_key}</TD>
                <TD>{quota.limit_value}</TD>
                <TD>{quota.quota_window}</TD>
                <TD>{quota.application_id ? appNameById.get(quota.application_id) ?? quota.application_id : "Org-wide"}</TD>
                <TD>{quota.is_active ? "active" : "inactive"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
