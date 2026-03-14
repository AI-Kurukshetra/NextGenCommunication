import { CampaignsRepository } from "@/server/repositories/campaigns-repository";
import { JobsRepository } from "@/server/repositories/jobs-repository";

export class CampaignService {
  private readonly campaignsRepository = new CampaignsRepository();
  private readonly jobsRepository = new JobsRepository();

  async create(payload: {
    organizationId: string;
    applicationId: string;
    name: string;
    templateId?: string;
    segmentFilter: Record<string, unknown>;
    scheduledAt?: string;
  }) {
    const campaign = await this.campaignsRepository.create(payload);

    await this.jobsRepository.enqueue({
      organizationId: payload.organizationId,
      jobType: "execute_campaign",
      payload: {
        campaignId: campaign.id
      },
      runAt: payload.scheduledAt ?? new Date().toISOString()
    });

    return campaign;
  }
}
