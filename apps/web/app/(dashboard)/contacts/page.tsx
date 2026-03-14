import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";

export default function ContactsPage() {
  return (
    <div>
      <PageHeader title="Contacts" description="Manage contacts, tags, and imports for campaign and workflow targeting." />
      <Card>
        <p className="text-sm">CSV imports are handled through the `/api/contacts/import` endpoint and queued background processing.</p>
      </Card>
    </div>
  );
}
