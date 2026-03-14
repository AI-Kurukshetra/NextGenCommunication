import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" description="Usage and deliverability metrics with tenant scoped reporting." />
      <Card>
        <p className="text-sm">Analytics endpoints aggregate usage records by minute/hour/day per application and channel.</p>
      </Card>
    </div>
  );
}
