import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { EmergencyService } from "@/server/services/emergency-service";

const schema = z.object({
  phoneNumberId: z.string().uuid(),
  locationId: z.string().uuid(),
  metadata: z.record(z.any()).optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "numbers:write");
    const body = await parseJson(request, schema);
    const service = new EmergencyService();

    const assignment = await service.assignNumber({
      organizationId: principal.organizationId,
      phoneNumberId: body.phoneNumberId,
      locationId: body.locationId,
      metadata: body.metadata
    });

    return Response.json(assignment, { status: 201 });
  });
}
