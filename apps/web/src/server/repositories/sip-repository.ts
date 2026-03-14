import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class SipRepository {
  private readonly supabase = createSupabaseAdminClient();

  async list(organizationId: string) {
    const { data, error } = await this.supabase
      .from("sip_endpoints")
      .select("id, organization_id, application_id, name, username, domain, transport, codecs, is_active, metadata, created_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return data;
  }

  async create(payload: {
    organizationId: string;
    applicationId: string;
    name: string;
    username: string;
    passwordSecret: string;
    domain: string;
    transport: string;
    codecs: string[];
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("sip_endpoints")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId,
        name: payload.name,
        username: payload.username,
        password_secret: payload.passwordSecret,
        domain: payload.domain,
        transport: payload.transport,
        codecs: payload.codecs,
        metadata: payload.metadata ?? {}
      })
      .select("id, organization_id, application_id, name, username, domain, transport, codecs, is_active, metadata, created_at")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
