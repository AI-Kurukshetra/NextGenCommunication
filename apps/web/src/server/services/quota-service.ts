import type { RequestPrincipal } from "@/server/services/api-auth-service";
import { checkQuotaLimit } from "@/lib/quota-limit";
import { QuotasRepository } from "@/server/repositories/quotas-repository";

export class QuotaService {
  private readonly quotasRepository = new QuotasRepository();

  async list(payload: { organizationId: string; applicationId?: string }) {
    return this.quotasRepository.list(payload);
  }

  async create(payload: {
    organizationId: string;
    applicationId?: string;
    quotaKey: string;
    limitValue: number;
    quotaWindow: "daily" | "monthly";
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    return this.quotasRepository.upsert(payload);
  }

  async enforceApiRequestQuota(principal: RequestPrincipal) {
    const quotas = await this.quotasRepository.listActiveForEnforcement({
      organizationId: principal.organizationId,
      applicationId: principal.applicationId,
      quotaKey: "api.requests"
    });

    for (const quota of quotas) {
      const key = [
        quota.organization_id,
        quota.application_id ?? "all-apps",
        quota.quota_key,
        quota.quota_window,
        principal.principalType,
        principal.principalId
      ].join(":");

      checkQuotaLimit({
        key,
        limit: quota.limit_value,
        window: quota.quota_window
      });
    }
  }
}
