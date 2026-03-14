import { withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { TemplatesService } from "@/server/services/templates-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: { id: string } }) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "templates:write");
    const service = new TemplatesService();
    const template = await service.submitForApproval(context.params.id, principal.organizationId);
    return Response.json(template);
  });
}