import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { NumbersService } from "@/server/services/numbers-service";

const schema = z.object({
  phoneNumberId: z.string().uuid(),
  applicationId: z.string().uuid()
});

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "numbers:write");
    const body = await parseJson(request, schema);

    const service = new NumbersService();
    const number = await service.assign({
      organizationId: principal.organizationId,
      phoneNumberId: body.phoneNumberId,
      applicationId: body.applicationId
    });

    return Response.json({
      id: number.id,
      phone_number: number.e164_number,
      application_id: number.application_id,
      status: number.status
    });
  });
}
