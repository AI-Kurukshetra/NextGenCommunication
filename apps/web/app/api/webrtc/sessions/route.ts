import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { WebRtcService } from "@/server/services/webrtc-service";

const schema = z.object({
  applicationId: z.string().uuid(),
  roomName: z.string().min(2),
  callId: z.string().uuid().optional(),
  ttlMinutes: z.number().int().min(1).max(1440).optional(),
  metadata: z.record(z.any()).optional()
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "voice:write");
    const service = new WebRtcService();
    const sessions = await service.list(principal.organizationId);
    return Response.json(sessions);
  });
}


export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "voice:write");
    const body = await parseJson(request, schema);
    const service = new WebRtcService();

    const session = await service.create({
      organizationId: principal.organizationId,
      applicationId: body.applicationId,
      roomName: body.roomName,
      callId: body.callId,
      ttlMinutes: body.ttlMinutes,
      metadata: body.metadata
    });

    return Response.json(session, { status: 201 });
  });
}
