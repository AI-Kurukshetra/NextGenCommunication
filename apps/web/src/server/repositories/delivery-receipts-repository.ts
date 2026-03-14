import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class DeliveryReceiptsRepository {
  private readonly supabase = createSupabaseAdminClient();

  async create(payload: {
    organizationId: string;
    messageId: string;
    provider: string;
    status: "delivered" | "failed";
    rawPayload?: Record<string, unknown>;
  }) {
    const { error } = await this.supabase.from("delivery_receipts").insert({
      organization_id: payload.organizationId,
      message_id: payload.messageId,
      provider: payload.provider,
      status: payload.status,
      raw_payload: payload.rawPayload ?? {}
    });

    if (error) {
      throw error;
    }
  }
}
