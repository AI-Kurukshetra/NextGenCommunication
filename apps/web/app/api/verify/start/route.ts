import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { VerifyService } from "@/server/services/verify-service";

const schema = z.object({
  to: z.string().min(8),
  from: z.string().min(8),
  ttlSeconds: z.number().min(60).max(900).optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "verify:write");
    const body = await parseJson(request, schema);
    const service = new VerifyService();

    const result = await service.start({
      organizationId: principal.organizationId,
      applicationId: principal.applicationId,
      ...body
    });

    return Response.json(result, { status: 201 });
  });
}
