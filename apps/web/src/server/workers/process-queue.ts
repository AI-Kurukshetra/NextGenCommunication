import { JobsRepository } from "@/server/repositories/jobs-repository";
import { MessagesService } from "@/server/services/messages-service";
import { WebhookService } from "@/server/services/webhook-service";
import { CampaignsRepository } from "@/server/repositories/campaigns-repository";

const jobsRepository = new JobsRepository();
const messagesService = new MessagesService();
const webhookService = new WebhookService();
const campaignsRepository = new CampaignsRepository();

export async function processQueueBatch() {
  const jobs = await jobsRepository.fetchDue(50);

  for (const job of jobs) {
    try {
      if (job.job_type === "message_status_update") {
        await messagesService.markStatus({
          messageId: job.payload.messageId,
          organizationId: job.organization_id,
          status: job.payload.status
        });
      } else if (job.job_type === "dispatch_webhook") {
        await webhookService.dispatch({
          organizationId: job.organization_id,
          eventType: job.payload.eventType,
          eventPayload: job.payload.payload
        });
      } else if (job.job_type === "execute_campaign") {
        await campaignsRepository.updateStatus(job.payload.campaignId, job.organization_id, "running");
        await campaignsRepository.updateStatus(job.payload.campaignId, job.organization_id, "completed");
      }

      await jobsRepository.markSucceeded(job.id);
    } catch (error) {
      await jobsRepository.markRetry(job, String(error));
    }
  }

  return {
    processed: jobs.length
  };
}
