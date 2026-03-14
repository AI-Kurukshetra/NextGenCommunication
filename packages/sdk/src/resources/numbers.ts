import { requestJson } from "../http";
import type { PurchaseNumberRequest } from "../types";

export class NumbersResource {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeoutMs: number
  ) {}

  async purchase(payload: PurchaseNumberRequest = {}) {
    return requestJson<{
      id: string;
      phone_number: string;
      status: string;
      capabilities: string[];
    }>(
      this.baseUrl,
      this.apiKey,
      "/api/numbers/purchase",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      this.timeoutMs
    );
  }
}
