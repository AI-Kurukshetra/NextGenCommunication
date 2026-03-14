import { JobsRepository } from "@/server/repositories/jobs-repository";

const jobs = new JobsRepository();

export async function enqueueWebhookEvent(organizationId: string, eventType: string, payload: Record<string, unknown>) {
  await jobs.enqueue({
    organizationId,
    jobType: "dispatch_webhook",
    payload: {
      eventType,
      payload
    }
  });
}

export async function enqueueMessageStatusUpdate(organizationId: string, messageId: string, status: string) {
  await jobs.enqueue({
    organizationId,
    jobType: "message_status_update",
    payload: { messageId, status }
  });
}
