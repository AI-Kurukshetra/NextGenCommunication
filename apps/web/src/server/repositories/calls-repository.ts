import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { CallStatus } from "@/lib/types";

export class CallsRepository {
  private readonly supabase = createSupabaseAdminClient();

  async create(payload: {
    organizationId: string;
    applicationId: string;
    toNumber: string;
    fromNumber: string;
    direction: "outbound" | "inbound";
    status: CallStatus;
    provider: string;
    providerCallId?: string | null;
    answerUrl?: string | null;
    record?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("calls")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId,
        to_number: payload.toNumber,
        from_number: payload.fromNumber,
        direction: payload.direction,
        status: payload.status,
        provider: payload.provider,
        provider_call_id: payload.providerCallId ?? null,
        answer_url: payload.answerUrl ?? null,
        record: payload.record ?? false,
        metadata: payload.metadata ?? {}
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateStatus(id: string, status: CallStatus, durationSeconds?: number) {
    const { error } = await this.supabase
      .from("calls")
      .update({
        status,
        duration_seconds: durationSeconds ?? null,
        ended_at: status === "completed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      throw error;
    }
  }
}
