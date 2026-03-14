import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { EmergencyService } from "@/server/services/emergency-service";

const createSchema = z.object({
  label: z.string().min(2),
  countryCode: z.string().min(2).max(4).default("US"),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  stateRegion: z.string().min(2),
  postalCode: z.string().min(3),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  metadata: z.record(z.any()).optional()
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request);
    const service = new EmergencyService();
    const rows = await service.listLocations(principal.organizationId);
    return Response.json(rows);
  });
}


export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "numbers:write");
    const body = await parseJson(request, createSchema);
    const service = new EmergencyService();

    const location = await service.createLocation({
      organizationId: principal.organizationId,
      label: body.label,
      countryCode: body.countryCode ?? "US",
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      city: body.city,
      stateRegion: body.stateRegion,
      postalCode: body.postalCode,
      latitude: body.latitude,
      longitude: body.longitude,
      metadata: body.metadata
    });

    return Response.json(location, { status: 201 });
  });
}
