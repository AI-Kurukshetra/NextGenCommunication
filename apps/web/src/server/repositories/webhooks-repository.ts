import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class WebhooksRepository {
  private readonly supabase = createSupabaseAdminClient();

  async create(payload: {
    organizationId: string;
    applicationId?: string;
    name: string;
    url: string;
    subscribedEvents: string[];
    signingSecret: string;
    maxRetries?: number;
  }) {
    const { data, error } = await this.supabase
      .from("webhooks")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId ?? null,
        name: payload.name,
        url: payload.url,
        subscribed_events: payload.subscribedEvents,
        signing_secret: payload.signingSecret,
        max_retries: payload.maxRetries ?? 10,
        is_active: true
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async listActive(organizationId: string, eventType: string) {
    const { data, error } = await this.supabase
      .from("webhooks")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .contains("subscribed_events", [eventType])
      .is("deleted_at", null);

    if (error) {
      throw error;
    }

    return data;
  }

  async logAttempt(payload: {
    organizationId: string;
    webhookId: string;
    eventType: string;
    requestPayload: Record<string, unknown>;
    responseStatus?: number;
    responseBody?: string;
    success: boolean;
    retryCount: number;
  }) {
    const { error } = await this.supabase.from("webhook_attempts").insert({
      organization_id: payload.organizationId,
      webhook_id: payload.webhookId,
      event_type: payload.eventType,
      request_payload: payload.requestPayload,
      response_status: payload.responseStatus ?? null,
      response_body: payload.responseBody ?? null,
      success: payload.success,
      retry_count: payload.retryCount
    });

    if (error) {
      throw error;
    }
  }
}
