import { requestJson } from "../http";

export class AnalyticsResource {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeoutMs: number
  ) {}

  async overview() {
    return requestJson<{
      total_spend_usd: number;
      total_units: number;
      top_events: Array<{ event_type: string; units: number }>;
    }>(this.baseUrl, this.apiKey, "/api/analytics/overview", {}, this.timeoutMs);
  }
}
