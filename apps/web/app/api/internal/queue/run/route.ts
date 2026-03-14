import { withApiErrorHandling } from "@/lib/route";
import { AppError } from "@/lib/errors";
import { processQueueBatch } from "@/server/workers/process-queue";

function assertInternalToken(request: Request) {
  const token = request.headers.get("x-internal-token");
  if (!process.env.CPAAS_INTERNAL_TOKEN || token !== process.env.CPAAS_INTERNAL_TOKEN) {
    throw new AppError("Unauthorized", { status: 401, code: "unauthorized" });
  }
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    assertInternalToken(request);
    const result = await processQueueBatch();
    return Response.json(result);
  });
}
