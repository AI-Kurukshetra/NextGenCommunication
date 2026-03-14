import { CallsRepository } from "@/server/repositories/calls-repository";
import { UsageRepository } from "@/server/repositories/usage-repository";
import { voiceProvider } from "@/server/integrations/voice-provider";
import { enqueueWebhookEvent } from "@/lib/queue";

export class VoiceService {
  private readonly callsRepository = new CallsRepository();
  private readonly usageRepository = new UsageRepository();

  async createCall(payload: {
    organizationId: string;
    applicationId: string;
    to: string;
    from: string;
    answerUrl?: string;
    record?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const providerResult = await voiceProvider.createCall({
      to: payload.to,
      from: payload.from,
      answerUrl: payload.answerUrl,
      record: payload.record
    });

    const call = await this.callsRepository.create({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      toNumber: payload.to,
      fromNumber: payload.from,
      direction: "outbound",
      status: providerResult.status,
      provider: "mock",
      providerCallId: providerResult.providerCallId,
      answerUrl: payload.answerUrl,
      record: payload.record,
      metadata: payload.metadata
    });

    await this.usageRepository.track({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      eventType: "voice.call_start",
      units: 1,
      unitType: "call",
      amountUsd: 0.03,
      referenceType: "call",
      referenceId: call.id
    });

    await enqueueWebhookEvent(payload.organizationId, "call.started", {
      call_id: call.id,
      to: payload.to,
      from: payload.from
    });

    return call;
  }

  async handleInbound(payload: {
    organizationId: string;
    applicationId: string;
    to: string;
    from: string;
    providerCallId?: string;
  }) {
    const call = await this.callsRepository.create({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      toNumber: payload.to,
      fromNumber: payload.from,
      direction: "inbound",
      status: "initiated",
      provider: "carrier-webhook",
      providerCallId: payload.providerCallId,
      record: false,
      metadata: {}
    });

    await enqueueWebhookEvent(payload.organizationId, "call.started", {
      call_id: call.id,
      to: payload.to,
      from: payload.from,
      direction: "inbound"
    });

    return call;
  }

  async endCall(payload: {
    organizationId: string;
    callId: string;
    durationSeconds: number;
  }) {
    await this.callsRepository.updateStatus(payload.callId, "completed", payload.durationSeconds);

    await this.usageRepository.track({
      organizationId: payload.organizationId,
      eventType: "voice.call_duration",
      units: payload.durationSeconds,
      unitType: "second",
      amountUsd: payload.durationSeconds * 0.0006,
      referenceType: "call",
      referenceId: payload.callId
    });

    await enqueueWebhookEvent(payload.organizationId, "call.ended", {
      call_id: payload.callId,
      duration_seconds: payload.durationSeconds
    });
  }
}
