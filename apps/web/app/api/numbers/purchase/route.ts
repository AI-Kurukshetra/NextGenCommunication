import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { NumbersService } from "@/server/services/numbers-service";

const schema = z.object({
  countryCode: z.string().length(2).default("US"),
  numberType: z.enum(["local", "toll_free", "mobile"]).default("local"),
  capabilities: z.array(z.string()).default(["sms", "voice"])
});

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "numbers:write");
    const body = await parseJson(request, schema);

    const service = new NumbersService();
    const number = await service.purchase({
      organizationId: principal.organizationId,
      applicationId: principal.applicationId,
      countryCode: body.countryCode ?? "US",
      numberType: body.numberType ?? "local",
      capabilities: body.capabilities ?? ["sms", "voice"]
    });

    return Response.json(
      {
        id: number.id,
        phone_number: number.e164_number,
        status: number.status,
        capabilities: number.capabilities
      },
      { status: 201 }
    );
  });
}
