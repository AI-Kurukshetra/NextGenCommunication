import { withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { UsageRepository } from "@/server/repositories/usage-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "usage:read");
    const usageRepository = new UsageRepository();
    const rows = await usageRepository.summary(principal.organizationId);

    const summary = rows.reduce<Record<string, { units: number; amount: number }>>((acc, row) => {
      if (!acc[row.event_type]) {
        acc[row.event_type] = { units: 0, amount: 0 };
      }
      acc[row.event_type].units += Number(row.units ?? 0);
      acc[row.event_type].amount += Number(row.amount_usd ?? 0);
      return acc;
    }, {});

    return Response.json({
      organization_id: principal.organizationId,
      summary
    });
  });
}
