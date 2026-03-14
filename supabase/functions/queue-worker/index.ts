import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  const now = new Date().toISOString();

  const { data: jobs, error } = await supabase
    .from("job_queue")
    .select("id, organization_id, job_type, payload, attempts, max_attempts")
    .eq("status", "queued")
    .lte("run_at", now)
    .order("run_at", { ascending: true })
    .limit(100);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let processed = 0;

  for (const job of jobs ?? []) {
    try {
      if (job.job_type === "dispatch_webhook") {
        await fetch(`${Deno.env.get("CPAAS_APP_URL")}/api/internal/webhook-dispatch`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-internal-token": Deno.env.get("CPAAS_INTERNAL_TOKEN") ?? ""
          },
          body: JSON.stringify({
            organizationId: job.organization_id,
            eventType: job.payload.eventType,
            payload: job.payload.payload
          })
        });
      }

      if (job.job_type === "message_status_update") {
        await fetch(`${Deno.env.get("CPAAS_APP_URL")}/api/internal/message-status`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-internal-token": Deno.env.get("CPAAS_INTERNAL_TOKEN") ?? ""
          },
          body: JSON.stringify({
            organizationId: job.organization_id,
            messageId: job.payload.messageId,
            status: job.payload.status
          })
        });
      }

      await supabase
        .from("job_queue")
        .update({ status: "succeeded", finished_at: new Date().toISOString() })
        .eq("id", job.id);
      processed += 1;
    } catch (workerError) {
      const nextAttempts = (job.attempts ?? 0) + 1;
      const failed = nextAttempts >= (job.max_attempts ?? 10);

      await supabase
        .from("job_queue")
        .update({
          status: failed ? "failed" : "queued",
          attempts: nextAttempts,
          last_error: String(workerError),
          run_at: failed
            ? null
            : new Date(Date.now() + Math.min(300000, nextAttempts * 10000)).toISOString(),
          finished_at: failed ? new Date().toISOString() : null
        })
        .eq("id", job.id);
    }
  }

  return new Response(JSON.stringify({ processed }), {
    headers: { "content-type": "application/json" }
  });
});
