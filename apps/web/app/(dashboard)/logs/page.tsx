import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";

export default function LogsPage() {
  return (
    <div>
      <PageHeader title="Logs" description="Structured request, event, and webhook logs for audit and debugging." />
      <Card>
        <p className="text-sm">Logs are emitted in JSON for downstream SIEM ingestion.</p>
      </Card>
    </div>
  );
}
