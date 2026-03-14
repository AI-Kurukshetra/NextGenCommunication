import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { AppError } from "@/lib/errors";
import { WebhookService } from "@/server/services/webhook-service";

const schema = z.object({
  organizationId: z.string().uuid(),
  eventType: z.string().min(1),
  payload: z.record(z.any())
});

function assertInternalToken(request: Request) {
  const token = request.headers.get("x-internal-token");
  if (!process.env.CPAAS_INTERNAL_TOKEN || token !== process.env.CPAAS_INTERNAL_TOKEN) {
    throw new AppError("Unauthorized", { status: 401, code: "unauthorized" });
  }
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    assertInternalToken(request);
    const body = await parseJson(request, schema);

    const service = new WebhookService();
    await service.dispatch({
      organizationId: body.organizationId,
      eventType: body.eventType,
      eventPayload: body.payload
    });

    return Response.json({ status: "ok" });
  });
}
