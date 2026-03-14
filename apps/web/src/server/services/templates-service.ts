import { TemplatesRepository } from "@/server/repositories/templates-repository";

export class TemplatesService {
  private readonly templatesRepository = new TemplatesRepository();

  async create(payload: {
    organizationId: string;
    applicationId: string;
    name: string;
    channel: "sms" | "mms" | "whatsapp" | "voice";
    body: string;
    variables?: string[];
  }) {
    return this.templatesRepository.create({
      ...payload,
      variables: payload.variables ?? []
    });
  }

  async submitForApproval(templateId: string, organizationId: string) {
    return this.templatesRepository.submitForApproval(templateId, organizationId);
  }

  async review(payload: {
    templateId: string;
    organizationId: string;
    approvedBy?: string;
    approved: boolean;
    notes?: string;
  }) {
    return this.templatesRepository.review(payload);
  }
}
