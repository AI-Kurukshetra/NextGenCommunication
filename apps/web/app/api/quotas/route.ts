import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { QuotaService } from "@/server/services/quota-service";

const schema = z.object({
  applicationId: z.string().uuid().optional(),
  quotaKey: z.string().min(2).default("api.requests"),
  limitValue: z.number().int().positive(),
  window: z.enum(["daily", "monthly"]),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "usage:read");
    const requestUrl = new URL(request.url);
    const applicationId = requestUrl.searchParams.get("applicationId") ?? undefined;

    const service = new QuotaService();
    const quotas = await service.list({
      organizationId: principal.organizationId,
      applicationId
    });

    return Response.json(quotas);
  });
}


export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "usage:read");
    const body = await parseJson(request, schema);
    const service = new QuotaService();

    const quota = await service.create({
      organizationId: principal.organizationId,
      applicationId: body.applicationId,
      quotaKey: body.quotaKey ?? "api.requests",
      limitValue: body.limitValue,
      quotaWindow: body.window,
      isActive: body.isActive,
      metadata: body.metadata
    });

    return Response.json(quota, { status: 201 });
  });
}
