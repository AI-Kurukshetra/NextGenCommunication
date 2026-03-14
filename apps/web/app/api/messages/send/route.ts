import { z } from "zod";
import { withApiErrorHandling, parseJson } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { MessagesService } from "@/server/services/messages-service";

const schema = z.object({
  to: z.string().min(8),
  from: z.string().min(8),
  text: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  metadata: z.record(z.any()).optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "messages:write");
    const body = await parseJson(request, schema);
    const service = new MessagesService();

    const message = await service.send({
      organizationId: principal.organizationId,
      applicationId: principal.applicationId,
      ...body
    });

    return Response.json(
      {
        id: message.id,
        status: message.status,
        to: message.to_number,
        from: message.from_number,
        segments: message.segment_count,
        created_at: message.created_at
      },
      { status: 202 }
    );
  });
}
