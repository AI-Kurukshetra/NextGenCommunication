import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { TemplatesService } from "@/server/services/templates-service";

const schema = z.object({
  approved: z.boolean(),
  notes: z.string().max(1000).optional(),
  approvedBy: z.string().uuid().optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: { id: string } }) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "templates:approve");
    const body = await parseJson(request, schema);

    const service = new TemplatesService();
    const template = await service.review({
      templateId: context.params.id,
      organizationId: principal.organizationId,
      approvedBy: body.approvedBy,
      approved: body.approved,
      notes: body.notes
    });

    return Response.json(template);
  });
}