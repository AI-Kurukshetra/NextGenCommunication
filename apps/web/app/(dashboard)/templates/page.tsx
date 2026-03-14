import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";

export default function TemplatesPage() {
  return (
    <div>
      <PageHeader title="Templates" description="Template authoring with approval lifecycle and compliance metadata." />
      <Card>
        <p className="text-sm">Templates support statuses: draft, pending_approval, approved, rejected, archived.</p>
      </Card>
    </div>
  );
}
