import { requestJson } from "../http";

export class UsageResource {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeoutMs: number
  ) {}

  async summary() {
    return requestJson<{
      organization_id: string;
      summary: Record<string, { units: number; amount: number }>;
    }>(this.baseUrl, this.apiKey, "/api/usage/summary", {}, this.timeoutMs);
  }
}
