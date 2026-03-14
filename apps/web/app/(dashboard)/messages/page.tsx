import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

const rows = [
  { id: "msg_01H", to: "+14155550199", status: "delivered", channel: "sms", segments: 1 },
  { id: "msg_02H", to: "+14155550211", status: "failed", channel: "mms", segments: 2 },
  { id: "msg_03H", to: "+14155550321", status: "queued", channel: "sms", segments: 1 }
];

export default function MessagesPage() {
  return (
    <div>
      <PageHeader title="Messages" description="SMS and MMS logs with delivery receipts and segment accounting." />
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>ID</TH>
              <TH>To</TH>
              <TH>Channel</TH>
              <TH>Segments</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={row.id}>
                <TD>{row.id}</TD>
                <TD>{row.to}</TD>
                <TD>{row.channel}</TD>
                <TD>{row.segments}</TD>
                <TD>
                  <Badge tone={row.status === "failed" ? "danger" : row.status === "delivered" ? "success" : "warning"}>
                    {row.status}
                  </Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
