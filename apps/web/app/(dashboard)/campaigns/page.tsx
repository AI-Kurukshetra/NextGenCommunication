import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";

export default function CampaignsPage() {
  return (
    <div>
      <PageHeader title="Campaigns" description="Bulk messaging with scheduling, segmentation, and throughput controls." />
      <Card>
        <p className="text-sm">Campaign queue, segmentation filters, and schedule controls are available via API and dashboard actions.</p>
      </Card>
    </div>
  );
}
