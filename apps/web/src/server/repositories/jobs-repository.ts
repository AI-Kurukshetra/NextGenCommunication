import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class JobsRepository {
  private readonly supabase = createSupabaseAdminClient();

  async enqueue(payload: {
    organizationId: string;
    jobType: string;
    payload: Record<string, unknown>;
    runAt?: string;
    maxAttempts?: number;
  }) {
    const { error } = await this.supabase.from("job_queue").insert({
      organization_id: payload.organizationId,
      job_type: payload.jobType,
      payload: payload.payload,
      run_at: payload.runAt ?? new Date().toISOString(),
      max_attempts: payload.maxAttempts ?? 10,
      status: "queued"
    });

    if (error) {
      throw error;
    }
  }

  async fetchDue(limit = 50) {
    const { data, error } = await this.supabase
      .from("job_queue")
      .select("*")
      .eq("status", "queued")
      .lte("run_at", new Date().toISOString())
      .order("run_at", { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async markSucceeded(jobId: string) {
    const { error } = await this.supabase
      .from("job_queue")
      .update({ status: "succeeded", finished_at: new Date().toISOString() })
      .eq("id", jobId);

    if (error) {
      throw error;
    }
  }

  async markRetry(job: { id: string; attempts: number; max_attempts: number }, errorMessage: string) {
    const attempts = job.attempts + 1;
    const failed = attempts >= job.max_attempts;
    const nextRunAt = new Date(Date.now() + Math.min(60_000, attempts * 5_000)).toISOString();

    const { error } = await this.supabase
      .from("job_queue")
      .update({
        status: failed ? "failed" : "queued",
        attempts,
        last_error: errorMessage,
        run_at: failed ? null : nextRunAt,
        finished_at: failed ? new Date().toISOString() : null
      })
      .eq("id", job.id);

    if (error) {
      throw error;
    }
  }
}
