import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { MessageStatus } from "@/lib/types";

export class MessagesRepository {
  private readonly supabase = createSupabaseAdminClient();

  async create(payload: {
    organizationId: string;
    applicationId: string;
    toNumber: string;
    fromNumber: string;
    body: string | null;
    mediaUrls: string[];
    direction: "outbound" | "inbound";
    status: MessageStatus;
    provider: string;
    providerMessageId?: string | null;
    segmentCount: number;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("messages")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId,
        to_number: payload.toNumber,
        from_number: payload.fromNumber,
        body: payload.body,
        media_urls: payload.mediaUrls,
        direction: payload.direction,
        status: payload.status,
        provider: payload.provider,
        provider_message_id: payload.providerMessageId ?? null,
        segment_count: payload.segmentCount,
        metadata: payload.metadata ?? {}
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateStatus(messageId: string, status: MessageStatus, errorCode?: string, errorMessage?: string) {
    const { error } = await this.supabase
      .from("messages")
      .update({
        status,
        error_code: errorCode ?? null,
        error_message: errorMessage ?? null,
        delivered_at: status === "delivered" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", messageId);

    if (error) {
      throw error;
    }
  }

  async getById(id: string, organizationId: string) {
    const { data, error } = await this.supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
