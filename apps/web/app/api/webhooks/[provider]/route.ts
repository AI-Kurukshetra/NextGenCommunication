import { z } from "zod";
import { withApiErrorHandling } from "@/lib/route";
import { MessagesService } from "@/server/services/messages-service";
import { VoiceService } from "@/server/services/voice-service";

const inboundSmsSchema = z.object({
  event: z.literal("inbound_sms"),
  organizationId: z.string().uuid(),
  applicationId: z.string().uuid(),
  to: z.string(),
  from: z.string(),
  body: z.string(),
  providerMessageId: z.string().optional()
});

const inboundCallSchema = z.object({
  event: z.literal("inbound_call"),
  organizationId: z.string().uuid(),
  applicationId: z.string().uuid(),
  to: z.string(),
  from: z.string(),
  providerCallId: z.string().optional()
});

const callEndedSchema = z.object({
  event: z.literal("call_ended"),
  organizationId: z.string().uuid(),
  callId: z.string().uuid(),
  durationSeconds: z.number().nonnegative()
});

export async function POST(request: Request, _: { params: { provider: string } }) {
  return withApiErrorHandling(async () => {
    const bodyRaw = await request.json();

    if (bodyRaw.event === "inbound_sms") {
      const body = inboundSmsSchema.parse(bodyRaw);
      const service = new MessagesService();
      const message = await service.handleInbound({
        organizationId: body.organizationId,
        applicationId: body.applicationId,
        to: body.to,
        from: body.from,
        body: body.body,
        providerMessageId: body.providerMessageId
      });

      return Response.json({ id: message.id, status: message.status });
    }

    if (bodyRaw.event === "inbound_call") {
      const body = inboundCallSchema.parse(bodyRaw);
      const service = new VoiceService();
      const call = await service.handleInbound({
        organizationId: body.organizationId,
        applicationId: body.applicationId,
        to: body.to,
        from: body.from,
        providerCallId: body.providerCallId
      });
      return Response.json({ id: call.id, status: call.status });
    }

    if (bodyRaw.event === "call_ended") {
      const body = callEndedSchema.parse(bodyRaw);
      const service = new VoiceService();
      await service.endCall({
        organizationId: body.organizationId,
        callId: body.callId,
        durationSeconds: body.durationSeconds
      });
      return Response.json({ status: "ok" });
    }

    return Response.json({ status: "ignored" }, { status: 202 });
  });
}
