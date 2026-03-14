import { withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { CdrService } from "@/server/services/cdr-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "usage:read");
    const requestUrl = new URL(request.url);
    const days = Number(requestUrl.searchParams.get("days") ?? 30);
    const applicationId = requestUrl.searchParams.get("applicationId") ?? undefined;

    const service = new CdrService();
    const summary = await service.summary({
      organizationId: principal.organizationId,
      applicationId,
      days: Number.isFinite(days) ? days : 30
    });

    return Response.json(summary);
  });
}
