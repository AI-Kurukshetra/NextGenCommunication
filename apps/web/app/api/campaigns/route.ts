import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { CampaignService } from "@/server/services/campaign-service";

const schema = z.object({
  name: z.string().min(2),
  templateId: z.string().uuid().optional(),
  segmentFilter: z.record(z.any()).default({}),
  scheduledAt: z.string().datetime().optional()
});

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "campaigns:write");
    const body = await parseJson(request, schema);
    const service = new CampaignService();

    const campaign = await service.create({
      organizationId: principal.organizationId,
      applicationId: principal.applicationId,
      name: body.name,
      templateId: body.templateId,
      segmentFilter: body.segmentFilter ?? {},
      scheduledAt: body.scheduledAt
    });

    return Response.json(campaign, { status: 201 });
  });
}
