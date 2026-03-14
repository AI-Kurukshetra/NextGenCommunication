import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { TemplatesService } from "@/server/services/templates-service";

const schema = z.object({
  name: z.string().min(2),
  channel: z.enum(["sms", "mms", "whatsapp", "voice"]),
  body: z.string().min(1),
  variables: z.array(z.string()).optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "templates:write");
    const body = await parseJson(request, schema);

    const service = new TemplatesService();
    const template = await service.create({
      organizationId: principal.organizationId,
      applicationId: principal.applicationId,
      ...body
    });

    return Response.json(template, { status: 201 });
  });
}
