import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";

export default function WebhooksPage() {
  return (
    <div>
      <PageHeader title="Webhooks" description="Event destination management with retries, signatures, and dead-letter visibility." />
      <Card>
        <p className="text-sm">Core events: message.delivered, message.failed, call.started, call.ended, inbound.sms.</p>
      </Card>
    </div>
  );
}
