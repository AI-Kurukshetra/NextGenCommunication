import { randomUUID } from "crypto";
import { WebhooksRepository } from "@/server/repositories/webhooks-repository";

export class WebhookConfigService {
  private readonly webhooksRepository = new WebhooksRepository();

  async create(payload: {
    organizationId: string;
    applicationId?: string;
    name: string;
    url: string;
    subscribedEvents: string[];
  }) {
    return this.webhooksRepository.create({
      ...payload,
      signingSecret: `whsec_${randomUUID().replace(/-/g, "")}`
    });
  }
}
