import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { VoiceService } from "@/server/services/voice-service";

const schema = z.object({
  to: z.string().min(8),
  from: z.string().min(8),
  answerUrl: z.string().url().optional(),
  record: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "voice:write");
    const body = await parseJson(request, schema);
    const service = new VoiceService();

    const call = await service.createCall({
      organizationId: principal.organizationId,
      applicationId: principal.applicationId,
      ...body
    });

    return Response.json(
      {
        id: call.id,
        status: call.status,
        to: call.to_number,
        from: call.from_number,
        created_at: call.created_at
      },
      { status: 202 }
    );
  });
}
