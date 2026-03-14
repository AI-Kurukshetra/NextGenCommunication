import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { AppError } from "@/lib/errors";
import { MessagesService } from "@/server/services/messages-service";

const schema = z.object({
  organizationId: z.string().uuid(),
  messageId: z.string().uuid(),
  status: z.enum(["delivered", "failed"]),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional()
});

function assertInternalToken(request: Request) {
  const token = request.headers.get("x-internal-token");
  if (!process.env.CPAAS_INTERNAL_TOKEN || token !== process.env.CPAAS_INTERNAL_TOKEN) {
    throw new AppError("Unauthorized", { status: 401, code: "unauthorized" });
  }
}

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    assertInternalToken(request);
    const body = await parseJson(request, schema);

    const service = new MessagesService();
    await service.markStatus({
      messageId: body.messageId,
      organizationId: body.organizationId,
      status: body.status,
      errorCode: body.errorCode,
      errorMessage: body.errorMessage
    });

    return Response.json({ status: "ok" });
  });
}
