import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class CdrRepository {
  private readonly supabase = createSupabaseAdminClient();

  async listSince(payload: { organizationId: string; fromIso: string }) {
    const { data, error } = await this.supabase
      .from("call_detail_records")
      .select("id, call_id, billable_seconds, billed_amount_usd, sip_response_code, created_at")
      .eq("organization_id", payload.organizationId)
      .is("deleted_at", null)
      .gte("created_at", payload.fromIso)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async listCallsByIds(payload: { organizationId: string; callIds: string[] }) {
    if (!payload.callIds.length) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("calls")
      .select("id, application_id, to_number, from_number, status, started_at, ended_at")
      .eq("organization_id", payload.organizationId)
      .in("id", payload.callIds);

    if (error) {
      throw error;
    }

    return data ?? [];
  }
}
