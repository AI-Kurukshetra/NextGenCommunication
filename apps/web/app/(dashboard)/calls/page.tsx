import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

const rows = [
  { id: "call_11", from: "+14155550111", to: "+14155550777", status: "completed", duration: "03:12" },
  { id: "call_12", from: "+14155550111", to: "+14155550779", status: "in-progress", duration: "00:49" }
];

export default function CallsPage() {
  return (
    <div>
      <PageHeader title="Calls" description="Outbound and inbound voice sessions, recordings, and event timelines." />
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Call SID</TH>
              <TH>From</TH>
              <TH>To</TH>
              <TH>Status</TH>
              <TH>Duration</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={row.id}>
                <TD>{row.id}</TD>
                <TD>{row.from}</TD>
                <TD>{row.to}</TD>
                <TD>{row.status}</TD>
                <TD>{row.duration}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
