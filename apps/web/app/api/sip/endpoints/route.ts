import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { SipService } from "@/server/services/sip-service";

const schema = z.object({
  name: z.string().min(2),
  applicationId: z.string().uuid(),
  domain: z.string().min(3),
  transport: z.enum(["udp", "tcp", "tls"]).default("udp"),
  codecs: z.array(z.string()).optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "voice:write");
    const service = new SipService();
    const endpoints = await service.list(principal.organizationId);
    return Response.json(endpoints);
  });
}


export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "voice:write");
    const body = await parseJson(request, schema);
    const service = new SipService();

    const endpoint = await service.create({
      organizationId: principal.organizationId,
      applicationId: body.applicationId,
      name: body.name,
      domain: body.domain,
      transport: body.transport,
      codecs: body.codecs,
      username: body.username,
      password: body.password,
      metadata: body.metadata
    });

    return Response.json(endpoint, { status: 201 });
  });
}
