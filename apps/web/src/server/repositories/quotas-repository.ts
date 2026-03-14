import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export interface ApiQuotaRow {
  id: string;
  organization_id: string;
  application_id: string | null;
  quota_key: string;
  limit_value: number;
  quota_window: "daily" | "monthly";
  is_active: boolean;
  metadata: Record<string, unknown> | null;
}

export class QuotasRepository {
  private readonly supabase = createSupabaseAdminClient();

  async list(payload: { organizationId: string; applicationId?: string }) {
    let query = this.supabase
      .from("api_quotas")
      .select("*")
      .eq("organization_id", payload.organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (payload.applicationId) {
      query = query.or(`application_id.is.null,application_id.eq.${payload.applicationId}`);
    }

    const { data, error } = await query.limit(200);

    if (error) {
      throw error;
    }

    return (data ?? []) as ApiQuotaRow[];
  }

  async upsert(payload: {
    organizationId: string;
    applicationId?: string;
    quotaKey: string;
    limitValue: number;
    quotaWindow: "daily" | "monthly";
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("api_quotas")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId ?? null,
        quota_key: payload.quotaKey,
        limit_value: payload.limitValue,
        quota_window: payload.quotaWindow,
        is_active: payload.isActive ?? true,
        metadata: payload.metadata ?? {}
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as ApiQuotaRow;
  }

  async listActiveForEnforcement(payload: {
    organizationId: string;
    applicationId: string;
    quotaKey: string;
  }) {
    const { data, error } = await this.supabase
      .from("api_quotas")
      .select("*")
      .eq("organization_id", payload.organizationId)
      .eq("quota_key", payload.quotaKey)
      .eq("is_active", true)
      .is("deleted_at", null)
      .or(`application_id.is.null,application_id.eq.${payload.applicationId}`)
      .limit(50);

    if (error) {
      throw error;
    }

    return (data ?? []) as ApiQuotaRow[];
  }
}
