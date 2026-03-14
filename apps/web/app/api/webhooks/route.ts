import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { WebhookConfigService } from "@/server/services/webhook-config-service";

const schema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  subscribedEvents: z.array(z.string()).min(1),
  applicationId: z.string().uuid().optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "webhooks:write");
    const body = await parseJson(request, schema);

    const service = new WebhookConfigService();
    const webhook = await service.create({
      organizationId: principal.organizationId,
      ...body
    });

    return Response.json(webhook, { status: 201 });
  });
}
