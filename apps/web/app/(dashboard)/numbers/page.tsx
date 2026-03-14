import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

const numbers = [
  { number: "+14155550111", type: "local", app: "Retail Notifications", status: "active" },
  { number: "+14155550112", type: "toll_free", app: "Voice Support", status: "porting" }
];

export default function NumbersPage() {
  return (
    <div>
      <PageHeader title="Phone Numbers" description="Inventory, assignment, purchase, and port-in management." />
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Number</TH>
              <TH>Type</TH>
              <TH>Application</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {numbers.map((number) => (
              <TR key={number.number}>
                <TD>{number.number}</TD>
                <TD>{number.type}</TD>
                <TD>{number.app}</TD>
                <TD>{number.status}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
