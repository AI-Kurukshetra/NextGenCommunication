import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";

export default function ApiKeysPage() {
  return (
    <div>
      <PageHeader title="API Keys" description="Per-application key lifecycle with scopes and rotation windows." />
      <Card>
        <p className="text-sm">Keys are hashed with SHA-256 and displayed once at creation time.</p>
      </Card>
    </div>
  );
}
