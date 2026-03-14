import { MessagesRepository } from "@/server/repositories/messages-repository";
import { UsageRepository } from "@/server/repositories/usage-repository";
import { DeliveryReceiptsRepository } from "@/server/repositories/delivery-receipts-repository";
import { smsProvider } from "@/server/integrations/sms-provider";
import { enqueueMessageStatusUpdate, enqueueWebhookEvent } from "@/lib/queue";
import { AppError } from "@/lib/errors";

export class MessagesService {
  private readonly messagesRepository = new MessagesRepository();
  private readonly usageRepository = new UsageRepository();
  private readonly receiptsRepository = new DeliveryReceiptsRepository();

  async send(payload: {
    organizationId: string;
    applicationId: string;
    to: string;
    from: string;
    text?: string;
    mediaUrls?: string[];
    metadata?: Record<string, unknown>;
  }) {
    if (!payload.text && (!payload.mediaUrls || payload.mediaUrls.length === 0)) {
      throw new AppError("Either text or mediaUrls is required", {
        status: 400,
        code: "validation_error"
      });
    }

    const providerResult = await smsProvider.sendMessage({
      to: payload.to,
      from: payload.from,
      text: payload.text,
      mediaUrls: payload.mediaUrls
    });

    const message = await this.messagesRepository.create({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      toNumber: payload.to,
      fromNumber: payload.from,
      body: payload.text ?? null,
      mediaUrls: payload.mediaUrls ?? [],
      direction: "outbound",
      status: providerResult.status,
      provider: "mock",
      providerMessageId: providerResult.providerMessageId,
      segmentCount: providerResult.segments,
      metadata: payload.metadata
    });

    await this.usageRepository.track({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      eventType: "sms.send",
      units: providerResult.segments,
      unitType: "segment",
      amountUsd: providerResult.segments * 0.0075,
      referenceType: "message",
      referenceId: message.id
    });

    await enqueueMessageStatusUpdate(payload.organizationId, message.id, "delivered");
    await enqueueWebhookEvent(payload.organizationId, "message.queued", {
      message_id: message.id,
      to: payload.to,
      from: payload.from
    });

    return message;
  }

  async get(messageId: string, organizationId: string) {
    return this.messagesRepository.getById(messageId, organizationId);
  }

  async handleInbound(payload: {
    organizationId: string;
    applicationId: string;
    to: string;
    from: string;
    body: string;
    providerMessageId?: string;
  }) {
    const message = await this.messagesRepository.create({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      toNumber: payload.to,
      fromNumber: payload.from,
      body: payload.body,
      mediaUrls: [],
      direction: "inbound",
      status: "received",
      provider: "carrier-webhook",
      providerMessageId: payload.providerMessageId,
      segmentCount: 1,
      metadata: {}
    });

    await enqueueWebhookEvent(payload.organizationId, "inbound.sms", {
      message_id: message.id,
      body: payload.body,
      to: payload.to,
      from: payload.from
    });

    return message;
  }

  async markStatus(payload: {
    messageId: string;
    organizationId: string;
    status: "delivered" | "failed";
    errorCode?: string;
    errorMessage?: string;
  }) {
    await this.messagesRepository.updateStatus(
      payload.messageId,
      payload.status,
      payload.errorCode,
      payload.errorMessage
    );

    await this.receiptsRepository.create({
      organizationId: payload.organizationId,
      messageId: payload.messageId,
      provider: "mock",
      status: payload.status,
      rawPayload: {
        errorCode: payload.errorCode,
        errorMessage: payload.errorMessage
      }
    });

    await enqueueWebhookEvent(payload.organizationId, `message.${payload.status}`, {
      message_id: payload.messageId,
      status: payload.status,
      error_code: payload.errorCode,
      error_message: payload.errorMessage
    });
  }
}
