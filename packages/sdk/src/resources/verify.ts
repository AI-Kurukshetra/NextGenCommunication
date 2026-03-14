import { requestJson } from "../http";
import type { VerifyCheckRequest, VerifyStartRequest } from "../types";

export class VerifyResource {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeoutMs: number
  ) {}

  async start(payload: VerifyStartRequest) {
    return requestJson<{
      verification_id: string;
      status: string;
      expires_at: string;
    }>(
      this.baseUrl,
      this.apiKey,
      "/api/verify/start",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      this.timeoutMs
    );
  }

  async check(payload: VerifyCheckRequest) {
    return requestJson<{
      verification_id: string;
      status: "approved" | "denied";
    }>(
      this.baseUrl,
      this.apiKey,
      "/api/verify/check",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      this.timeoutMs
    );
  }
}
