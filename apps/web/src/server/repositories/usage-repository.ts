import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class UsageRepository {
  private readonly supabase = createSupabaseAdminClient();

  async track(payload: {
    organizationId: string;
    applicationId?: string;
    eventType: string;
    units: number;
    unitType: string;
    amountUsd?: number;
    referenceType?: string;
    referenceId?: string;
    metadata?: Record<string, unknown>;
  }) {
    const { error } = await this.supabase.from("usage_records").insert({
      organization_id: payload.organizationId,
      application_id: payload.applicationId ?? null,
      event_type: payload.eventType,
      units: payload.units,
      unit_type: payload.unitType,
      amount_usd: payload.amountUsd ?? 0,
      reference_type: payload.referenceType ?? null,
      reference_id: payload.referenceId ?? null,
      metadata: payload.metadata ?? {}
    });

    if (error) {
      throw error;
    }
  }

  async summary(organizationId: string) {
    const { data, error } = await this.supabase
      .from("usage_records")
      .select("event_type, units, amount_usd")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      throw error;
    }

    return data;
  }
}
