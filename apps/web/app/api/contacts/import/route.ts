import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { ContactsService } from "@/server/services/contacts-service";

const schema = z.object({
  csv: z.string().min(5)
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "contacts:write");
    const body = await parseJson(request, schema);

    const service = new ContactsService();
    const result = await service.importCsv({
      organizationId: principal.organizationId,
      applicationId: principal.applicationId,
      csv: body.csv
    });

    return Response.json(result, { status: 201 });
  });
}
