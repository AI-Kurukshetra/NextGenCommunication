import { randomUUID } from "crypto";
import { WebhooksRepository } from "@/server/repositories/webhooks-repository";
import { signWebhookPayload } from "@/lib/webhook-signature";

export class WebhookService {
  private readonly webhooksRepository = new WebhooksRepository();

  async dispatch(payload: {
    organizationId: string;
    eventType: string;
    eventPayload: Record<string, unknown>;
  }) {
    const hooks = await this.webhooksRepository.listActive(payload.organizationId, payload.eventType);

    for (const hook of hooks) {
      const body = JSON.stringify({
        id: randomUUID(),
        event: payload.eventType,
        data: payload.eventPayload,
        created_at: new Date().toISOString()
      });
      const signature = signWebhookPayload(body);

      try {
        const response = await fetch(hook.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-nextgen-signature": signature,
            "x-nextgen-event": payload.eventType
          },
          body
        });

        await this.webhooksRepository.logAttempt({
          organizationId: payload.organizationId,
          webhookId: hook.id,
          eventType: payload.eventType,
          requestPayload: payload.eventPayload,
          responseStatus: response.status,
          responseBody: await response.text(),
          success: response.ok,
          retryCount: 0
        });
      } catch (error) {
        await this.webhooksRepository.logAttempt({
          organizationId: payload.organizationId,
          webhookId: hook.id,
          eventType: payload.eventType,
          requestPayload: payload.eventPayload,
          success: false,
          responseBody: String(error),
          retryCount: 0
        });
        throw error;
      }
    }
  }
}
