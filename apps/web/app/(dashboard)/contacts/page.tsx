import { PageHeader } from "@/components/dashboard/page-header";
import { DonutChart, GroupedBarChart } from "@/components/dashboard/charts";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getDashboardContext } from "@/lib/dashboard-context";

type ContactRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string;
  email: string | null;
  tags: string[];
};

export default async function ContactsPage() {
  const { supabase, organization } = await getDashboardContext();
  const { data } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, phone, email, tags")
    .eq("organization_id", organization.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(30);

  const contacts = (data ?? []) as ContactRow[];
  const topTags = Object.entries(
    contacts.reduce<Record<string, number>>((acc, contact) => {
      for (const tag of contact.tags ?? []) {
        acc[tag] = (acc[tag] ?? 0) + 1;
      }
      return acc;
    }, {})
  )
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const coverage = [
    { channel: "Phone", contacts: contacts.filter((contact) => Boolean(contact.phone)).length },
    { channel: "Email", contacts: contacts.filter((contact) => Boolean(contact.email)).length },
    { channel: "Tagged", contacts: contacts.filter((contact) => (contact.tags ?? []).length > 0).length }
  ];

  return (
    <div>
      <PageHeader title="Contacts" description="Manage contacts, tags, and imports for campaign and workflow targeting." />
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Top Audience Tags</h3>
          <DonutChart className="mt-4" data={topTags} nameKey="tag" valueKey="count" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Contact Profile Coverage</h3>
          <GroupedBarChart
            className="mt-4"
            data={coverage}
            xKey="channel"
            series={[{ key: "contacts", label: "Contacts", color: "#0284c7" }]}
          />
        </Card>
      </div>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Phone</TH>
              <TH>Email</TH>
              <TH>Tags</TH>
            </TR>
          </THead>
          <TBody>
            {contacts.map((contact) => (
              <TR key={contact.id}>
                <TD>{`${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "-"}</TD>
                <TD>{contact.phone}</TD>
                <TD>{contact.email ?? "-"}</TD>
                <TD>{contact.tags?.length ? contact.tags.join(", ") : "-"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
