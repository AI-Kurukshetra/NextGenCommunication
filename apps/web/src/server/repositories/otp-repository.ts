import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class OtpRepository {
  private readonly supabase = createSupabaseAdminClient();

  async create(payload: {
    organizationId: string;
    applicationId: string;
    toNumber: string;
    codeHash: string;
    expiresAt: string;
    channel?: string;
  }) {
    const { data, error } = await this.supabase
      .from("otp_verifications")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId,
        to_number: payload.toNumber,
        code_hash: payload.codeHash,
        expires_at: payload.expiresAt,
        channel: payload.channel ?? "sms",
        status: "pending"
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async findActive(organizationId: string, toNumber: string) {
    const { data, error } = await this.supabase
      .from("otp_verifications")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("to_number", toNumber)
      .eq("status", "pending")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async markResult(id: string, status: "verified" | "expired" | "failed") {
    const { error } = await this.supabase
      .from("otp_verifications")
      .update({ status, verified_at: status === "verified" ? new Date().toISOString() : null })
      .eq("id", id);

    if (error) {
      throw error;
    }
  }
}
