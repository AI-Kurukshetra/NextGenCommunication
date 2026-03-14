import { withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { UsageRepository } from "@/server/repositories/usage-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "analytics:read");
    const usageRepository = new UsageRepository();
    const rows = await usageRepository.summary(principal.organizationId);

    const totalSpend = rows.reduce((acc, row) => acc + Number(row.amount_usd ?? 0), 0);
    const totalUnits = rows.reduce((acc, row) => acc + Number(row.units ?? 0), 0);

    return Response.json({
      total_spend_usd: Number(totalSpend.toFixed(4)),
      total_units: totalUnits,
      top_events: Object.entries(
        rows.reduce<Record<string, number>>((acc, row) => {
          acc[row.event_type] = (acc[row.event_type] ?? 0) + Number(row.units ?? 0);
          return acc;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([event_type, units]) => ({ event_type, units }))
    });
  });
}
