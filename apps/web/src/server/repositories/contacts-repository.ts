import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class ContactsRepository {
  private readonly supabase = createSupabaseAdminClient();

  async upsertMany(organizationId: string, applicationId: string, contacts: Array<{ phone: string; firstName?: string; lastName?: string; email?: string; tags?: string[]; metadata?: Record<string, unknown> }>) {
    if (!contacts.length) {
      return;
    }

    const payload = contacts.map((contact) => ({
      organization_id: organizationId,
      application_id: applicationId,
      phone: contact.phone,
      first_name: contact.firstName ?? null,
      last_name: contact.lastName ?? null,
      email: contact.email ?? null,
      tags: contact.tags ?? [],
      metadata: contact.metadata ?? {}
    }));

    const { error } = await this.supabase
      .from("contacts")
      .upsert(payload, { onConflict: "organization_id,phone" });

    if (error) {
      throw error;
    }
  }
}
