import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div>
      <PageHeader title="Billing" description="Balance, invoices, and pricing controls by organization." />
      <Card>
        <p className="text-sm">Billing ledger and invoice generation are backed by `billing_accounts` + `usage_records` rollups.</p>
      </Card>
    </div>
  );
}
