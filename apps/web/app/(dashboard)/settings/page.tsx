import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Org policies, auth controls, and compliance preferences." />
      <Card>
        <p className="text-sm">Configure OAuth clients, IP allow lists, and webhook signing secrets here.</p>
      </Card>
    </div>
  );
}
